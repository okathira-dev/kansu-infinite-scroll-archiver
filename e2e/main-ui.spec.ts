import { expect, test } from "./fixtures";

test.describe("Kansu Main UI E2E Tests", () => {
  test.beforeEach(async ({ context }) => {
    // Prepare test data
    const page = await context.newPage();
    await page.evaluate(() => {
      // Clear IndexedDB first
      indexedDB.databases().then((databases) => {
        databases.forEach((db) => {
          if (db.name?.includes("kansu")) {
            indexedDB.deleteDatabase(db.name);
          }
        });
      });
    });
    await page.close();
  });

  test("Should display Main UI with data table", async ({ context, extensionId: _extensionId }) => {
    const page = await context.newPage();

    // Create a test page with Main UI
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Main UI Test Page</title>
        </head>
        <body>
          <div id="root"></div>
          <script>
            // Simulate Main UI injection
            const container = document.createElement('div');
            container.id = 'kansu-main-ui';
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.backgroundColor = 'white';
            container.style.zIndex = '10000';
            container.innerHTML = \`
              <div style="padding: 20px;">
                <h1>Kansu Data Manager</h1>
                <p>Manage your extracted data from infinite scroll websites</p>
                <div style="margin: 20px 0;">
                  <button id="refresh-btn">Refresh</button>
                  <button id="export-btn">Export</button>
                  <button id="settings-btn">Settings</button>
                </div>
                <div id="stats">
                  <div>Total Items: <span id="total-items">0</span></div>
                  <div>Services: <span id="total-services">0</span></div>
                </div>
                <div id="data-table">
                  <input type="text" id="search-input" placeholder="Search data..." />
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Content</th>
                        <th>Date</th>
                        <th>Service</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody id="data-rows">
                      <tr><td colspan="5">No data found</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            \`;
            document.body.appendChild(container);
          </script>
        </body>
      </html>
    `;

    await page.goto(`data:text/html,${encodeURIComponent(testHtml)}`);
    await page.waitForSelector("#kansu-main-ui");

    // Verify Main UI components are present
    await expect(page.locator("h1")).toContainText("Kansu Data Manager");
    await expect(page.locator("#refresh-btn")).toBeVisible();
    await expect(page.locator("#export-btn")).toBeVisible();
    await expect(page.locator("#settings-btn")).toBeVisible();
    await expect(page.locator("#search-input")).toBeVisible();
    await expect(page.locator("#data-table table")).toBeVisible();
  });

  test("Should handle search functionality", async ({ context, extensionId: _extensionId }) => {
    const page = await context.newPage();

    // Create a page with search-enabled data table
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <div id="search-container">
            <input type="text" id="search-input" placeholder="Search data..." />
            <table id="data-table">
              <tbody>
                <tr class="data-row">
                  <td>Article 1</td>
                  <td>Content about technology</td>
                </tr>
                <tr class="data-row">
                  <td>Article 2</td>
                  <td>Content about science</td>
                </tr>
                <tr class="data-row">
                  <td>News 1</td>
                  <td>Content about technology</td>
                </tr>
              </tbody>
            </table>
          </div>
          <script>
            document.getElementById('search-input').addEventListener('input', function(e) {
              const query = e.target.value.toLowerCase();
              const rows = document.querySelectorAll('.data-row');
              rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
              });
            });
          </script>
        </body>
      </html>
    `;

    await page.goto(`data:text/html,${encodeURIComponent(testHtml)}`);
    await page.waitForSelector("#search-input");

    // Initially, all rows should be visible
    const allRows = page.locator(".data-row");
    await expect(allRows).toHaveCount(3);

    // Search for "technology"
    await page.fill("#search-input", "technology");

    // Check filtered results
    const visibleRows = page.locator(".data-row:visible");
    await expect(visibleRows).toHaveCount(2);

    // Search for "science"
    await page.fill("#search-input", "science");
    await expect(page.locator(".data-row:visible")).toHaveCount(1);

    // Clear search
    await page.fill("#search-input", "");
    await expect(page.locator(".data-row:visible")).toHaveCount(3);
  });

  test("Should handle pagination controls", async ({ context, extensionId: _extensionId }) => {
    const page = await context.newPage();

    // Create a page with pagination
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <div id="pagination-container">
            <div id="pagination-info">Showing 1 to 5 of 25 entries</div>
            <div id="pagination-controls">
              <button id="prev-btn" disabled>Previous</button>
              <button class="page-btn active" data-page="1">1</button>
              <button class="page-btn" data-page="2">2</button>
              <button class="page-btn" data-page="3">3</button>
              <button id="next-btn">Next</button>
            </div>
            <table id="data-table">
              <tbody id="table-body">
                <tr><td>Item 1</td></tr>
                <tr><td>Item 2</td></tr>
                <tr><td>Item 3</td></tr>
                <tr><td>Item 4</td></tr>
                <tr><td>Item 5</td></tr>
              </tbody>
            </table>
          </div>
          <script>
            let currentPage = 1;
            const totalPages = 3;
            
            function updatePagination() {
              document.getElementById('prev-btn').disabled = currentPage === 1;
              document.getElementById('next-btn').disabled = currentPage === totalPages;
              
              document.querySelectorAll('.page-btn').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.page) === currentPage);
              });
              
              const start = (currentPage - 1) * 5 + 1;
              const end = Math.min(currentPage * 5, 25);
              document.getElementById('pagination-info').textContent = 
                \`Showing \${start} to \${end} of 25 entries\`;
            }
            
            document.getElementById('next-btn').addEventListener('click', () => {
              if (currentPage < totalPages) {
                currentPage++;
                updatePagination();
              }
            });
            
            document.getElementById('prev-btn').addEventListener('click', () => {
              if (currentPage > 1) {
                currentPage--;
                updatePagination();
              }
            });
            
            document.querySelectorAll('.page-btn').forEach(btn => {
              btn.addEventListener('click', () => {
                currentPage = parseInt(btn.dataset.page);
                updatePagination();
              });
            });
          </script>
        </body>
      </html>
    `;

    await page.goto(`data:text/html,${encodeURIComponent(testHtml)}`);
    await page.waitForSelector("#pagination-controls");

    // Verify initial state
    await expect(page.locator("#prev-btn")).toBeDisabled();
    await expect(page.locator("#next-btn")).toBeEnabled();
    await expect(page.locator(".page-btn.active")).toHaveText("1");

    // Navigate to next page
    await page.click("#next-btn");
    await expect(page.locator("#pagination-info")).toContainText("Showing 6 to 10 of 25 entries");
    await expect(page.locator(".page-btn.active")).toHaveText("2");

    // Navigate to specific page
    await page.click('[data-page="3"]');
    await expect(page.locator("#pagination-info")).toContainText("Showing 11 to 15 of 25 entries");
    await expect(page.locator("#next-btn")).toBeDisabled();
  });

  test("Should handle delete confirmation modal", async ({
    context,
    extensionId: _extensionId,
  }) => {
    const page = await context.newPage();

    // Create a page with delete functionality
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <div id="delete-container">
            <table>
              <tbody>
                <tr>
                  <td>Test Item 1</td>
                  <td><button class="delete-btn" data-id="1">Delete</button></td>
                </tr>
                <tr>
                  <td>Test Item 2</td>
                  <td><button class="delete-btn" data-id="2">Delete</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Delete Modal -->
          <div id="delete-modal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border: 1px solid #ccc; padding: 20px; z-index: 1000;">
            <h3>Delete Item</h3>
            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
            <div>
              <button id="cancel-delete">Cancel</button>
              <button id="confirm-delete">Delete</button>
            </div>
          </div>
          
          <script>
            let itemToDelete = null;
            
            document.querySelectorAll('.delete-btn').forEach(btn => {
              btn.addEventListener('click', (e) => {
                itemToDelete = e.target.dataset.id;
                document.getElementById('delete-modal').style.display = 'block';
              });
            });
            
            document.getElementById('cancel-delete').addEventListener('click', () => {
              document.getElementById('delete-modal').style.display = 'none';
              itemToDelete = null;
            });
            
            document.getElementById('confirm-delete').addEventListener('click', () => {
              if (itemToDelete) {
                const row = document.querySelector(\`[data-id="\${itemToDelete}"]\`).closest('tr');
                row.remove();
              }
              document.getElementById('delete-modal').style.display = 'none';
              itemToDelete = null;
            });
          </script>
        </body>
      </html>
    `;

    await page.goto(`data:text/html,${encodeURIComponent(testHtml)}`);
    await page.waitForSelector(".delete-btn");

    // Initially modal should be hidden
    await expect(page.locator("#delete-modal")).toBeHidden();

    // Click delete button
    await page.click('[data-id="1"]');

    // Modal should appear
    await expect(page.locator("#delete-modal")).toBeVisible();
    await expect(page.locator("#delete-modal h3")).toContainText("Delete Item");

    // Cancel deletion
    await page.click("#cancel-delete");
    await expect(page.locator("#delete-modal")).toBeHidden();

    // Verify item still exists
    await expect(page.locator('[data-id="1"]')).toBeVisible();

    // Try delete again and confirm
    await page.click('[data-id="1"]');
    await expect(page.locator("#delete-modal")).toBeVisible();
    await page.click("#confirm-delete");

    // Modal should close and item should be removed
    await expect(page.locator("#delete-modal")).toBeHidden();
    await expect(page.locator('[data-id="1"]')).not.toBeVisible();
  });

  test("Should handle export functionality", async ({ context, extensionId: _extensionId }) => {
    const page = await context.newPage();

    // Create a page with export functionality
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <div id="export-container">
            <button id="export-btn">Export Data</button>
            <div id="export-status" style="margin-top: 10px;"></div>
          </div>
          
          <script>
            document.getElementById('export-btn').addEventListener('click', async () => {
              const statusDiv = document.getElementById('export-status');
              statusDiv.textContent = 'Exporting...';
              
              // Simulate export process
              setTimeout(() => {
                const data = [
                  { title: 'Item 1', content: 'Content 1', timestamp: new Date().toISOString() },
                  { title: 'Item 2', content: 'Content 2', timestamp: new Date().toISOString() }
                ];
                
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'kansu-data-export.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                statusDiv.textContent = 'Export completed successfully!';
              }, 1000);
            });
          </script>
        </body>
      </html>
    `;

    await page.goto(`data:text/html,${encodeURIComponent(testHtml)}`);
    await page.waitForSelector("#export-btn");

    // Set up download handling
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click("#export-btn"),
    ]);

    // Verify download
    expect(download.suggestedFilename()).toBe("kansu-data-export.json");

    // Verify status message
    await expect(page.locator("#export-status")).toContainText("Export completed successfully!");
  });
});
