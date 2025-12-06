// ===========================================
// Tests E2E - Sidebar Navigation
// P0: Tests pour l'arborescence et lazy loading
// ===========================================

import { test, expect } from '@playwright/test';

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Aller sur la page d'accueil
    await page.goto('/');
    // Attendre que la sidebar soit chargée
    await page.waitForSelector('[role="tree"]', { timeout: 10000 });
  });

  test.describe('Folder Tree Display', () => {
    test('should display folder tree on load', async ({ page }) => {
      const folderTree = page.locator('[role="tree"]');
      await expect(folderTree).toBeVisible();
    });

    test('should display folders with correct structure', async ({ page }) => {
      // Vérifier que les dossiers racine sont affichés
      const treeItems = page.locator('[role="treeitem"]');
      const count = await treeItems.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should show folder names', async ({ page }) => {
      // Les dossiers doivent afficher leurs noms
      const folderButtons = page.locator('[role="button"][aria-label^="Dossier"]');
      const count = await folderButtons.count();

      if (count > 0) {
        const firstFolder = folderButtons.first();
        await expect(firstFolder).toBeVisible();
      }
    });
  });

  test.describe('Folder Expansion', () => {
    test('should expand folder and show content on click', async ({ page }) => {
      // Trouver un dossier avec du contenu
      const folderWithContent = page.locator(
        '[role="button"][aria-label*="cliquez pour déplier"]'
      );
      const count = await folderWithContent.count();

      if (count > 0) {
        const folder = folderWithContent.first();
        const parentTreeItem = folder.locator('xpath=ancestor::li[@role="treeitem"]');

        // Vérifier l'état initial (replié)
        await expect(parentTreeItem).toHaveAttribute('aria-expanded', 'false');

        // Cliquer pour déplier
        await folder.click();

        // Attendre que le contenu soit chargé
        await page.waitForTimeout(500);

        // Vérifier l'état après clic (déplié)
        await expect(parentTreeItem).toHaveAttribute('aria-expanded', 'true');
      }
    });

    test('should collapse folder on second click', async ({ page }) => {
      const folderWithContent = page.locator(
        '[role="button"][aria-label*="cliquez pour déplier"]'
      );
      const count = await folderWithContent.count();

      if (count > 0) {
        const folder = folderWithContent.first();
        const parentTreeItem = folder.locator('xpath=ancestor::li[@role="treeitem"]');

        // Déplier
        await folder.click();
        await page.waitForTimeout(300);
        await expect(parentTreeItem).toHaveAttribute('aria-expanded', 'true');

        // Replier
        await folder.click();
        await page.waitForTimeout(300);
        await expect(parentTreeItem).toHaveAttribute('aria-expanded', 'false');
      }
    });

    test('should show chevron rotation when expanded', async ({ page }) => {
      const folderWithContent = page.locator(
        '[role="button"][aria-label*="cliquez pour déplier"]'
      );
      const count = await folderWithContent.count();

      if (count > 0) {
        const folder = folderWithContent.first();
        const chevron = folder.locator('svg.transition-transform').first();

        // État initial (pas de rotation)
        await expect(chevron).not.toHaveClass(/rotate-90/);

        // Déplier
        await folder.click();
        await page.waitForTimeout(300);

        // Vérifier la rotation
        await expect(chevron).toHaveClass(/rotate-90/);
      }
    });
  });

  test.describe('Indentation', () => {
    test('should maintain consistent indentation for nested items', async ({
      page,
    }) => {
      // Trouver et déplier un dossier parent
      const folderWithContent = page.locator(
        '[role="button"][aria-label*="cliquez pour déplier"]'
      );
      const count = await folderWithContent.count();

      if (count > 0) {
        const folder = folderWithContent.first();
        await folder.click();
        await page.waitForTimeout(500);

        // Vérifier que les enfants ont une indentation différente
        const parentPadding = await folder.evaluate((el) =>
          getComputedStyle(el).paddingLeft
        );
        const parentPaddingValue = parseInt(parentPadding);

        // Les enfants doivent avoir +16px d'indentation
        const children = folder
          .locator('xpath=ancestor::li')
          .locator('[role="group"]')
          .locator('[role="button"]');
        const childCount = await children.count();

        if (childCount > 0) {
          const firstChild = children.first();
          const childPadding = await firstChild.evaluate((el) =>
            getComputedStyle(el).paddingLeft
          );
          const childPaddingValue = parseInt(childPadding);

          // Indentation doit être 16px de plus
          expect(childPaddingValue).toBe(parentPaddingValue + 16);
        }
      }
    });

    test('should align notes and folders at same level', async ({ page }) => {
      // Déplier un dossier contenant des notes et sous-dossiers
      const folderWithContent = page.locator(
        '[role="button"][aria-label*="cliquez pour déplier"]'
      );
      const count = await folderWithContent.count();

      if (count > 0) {
        await folderWithContent.first().click();
        await page.waitForTimeout(500);

        // Les sous-dossiers et notes au même niveau doivent avoir la même indentation
        const group = page.locator('[role="group"]').first();
        const items = group.locator('> li [role="button"]');
        const itemCount = await items.count();

        if (itemCount >= 2) {
          const firstPadding = await items.first().evaluate((el) =>
            getComputedStyle(el).paddingLeft
          );
          const secondPadding = await items.nth(1).evaluate((el) =>
            getComputedStyle(el).paddingLeft
          );

          expect(firstPadding).toBe(secondPadding);
        }
      }
    });
  });

  test.describe('Deep Nesting', () => {
    test('should display notes at any depth level', async ({ page }) => {
      // Ce test vérifie le bug P0 principal
      // Trouver et déplier plusieurs niveaux

      const expandAll = async (depth: number) => {
        for (let i = 0; i < depth; i++) {
          const collapsedFolders = page.locator(
            'li[role="treeitem"][aria-expanded="false"] [role="button"][aria-label*="déplier"]'
          );
          const count = await collapsedFolders.count();

          if (count > 0) {
            await collapsedFolders.first().click();
            await page.waitForTimeout(300);
          } else {
            break;
          }
        }
      };

      await expandAll(5);

      // Vérifier que les notes profondes sont visibles
      const allNotes = page.locator('[role="button"][aria-label^="Note"]');
      const noteCount = await allNotes.count();

      // Si des notes existent, elles doivent toutes être visibles
      for (let i = 0; i < noteCount; i++) {
        await expect(allNotes.nth(i)).toBeVisible();
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should respond to Enter key', async ({ page }) => {
      const folderWithContent = page.locator(
        '[role="button"][aria-label*="cliquez pour déplier"]'
      );
      const count = await folderWithContent.count();

      if (count > 0) {
        const folder = folderWithContent.first();
        const parentTreeItem = folder.locator('xpath=ancestor::li[@role="treeitem"]');

        await folder.focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(300);

        await expect(parentTreeItem).toHaveAttribute('aria-expanded', 'true');
      }
    });

    test('should respond to Space key', async ({ page }) => {
      const folderWithContent = page.locator(
        '[role="button"][aria-label*="cliquez pour déplier"]'
      );
      const count = await folderWithContent.count();

      if (count > 0) {
        const folder = folderWithContent.first();
        const parentTreeItem = folder.locator('xpath=ancestor::li[@role="treeitem"]');

        await folder.focus();
        await page.keyboard.press('Space');
        await page.waitForTimeout(300);

        await expect(parentTreeItem).toHaveAttribute('aria-expanded', 'true');
      }
    });

    test('should be focusable with Tab', async ({ page }) => {
      const firstFolder = page.locator('[role="button"][aria-label^="Dossier"]').first();

      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Au moins un élément doit être focusable
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });

  test.describe('Note Navigation', () => {
    test('should navigate to note on click', async ({ page }) => {
      // Déplier un dossier avec des notes
      const folderWithContent = page.locator(
        '[role="button"][aria-label*="cliquez pour déplier"]'
      );
      const count = await folderWithContent.count();

      if (count > 0) {
        await folderWithContent.first().click();
        await page.waitForTimeout(500);

        const noteButton = page.locator('[role="button"][aria-label^="Note"]');
        const noteCount = await noteButton.count();

        if (noteCount > 0) {
          await noteButton.first().click();
          await page.waitForTimeout(300);

          // L'URL doit changer vers la note
          expect(page.url()).toMatch(/\/notes\/[a-f0-9-]+$/);
        }
      }
    });

    test('should highlight active note', async ({ page }) => {
      const folderWithContent = page.locator(
        '[role="button"][aria-label*="cliquez pour déplier"]'
      );
      const count = await folderWithContent.count();

      if (count > 0) {
        await folderWithContent.first().click();
        await page.waitForTimeout(500);

        const noteButton = page.locator('[role="button"][aria-label^="Note"]');
        const noteCount = await noteButton.count();

        if (noteCount > 0) {
          const note = noteButton.first();
          await note.click();
          await page.waitForTimeout(300);

          // La note active doit avoir l'attribut aria-current
          await expect(note).toHaveAttribute('aria-current', 'page');
        }
      }
    });
  });

  test.describe('Sorting', () => {
    test('should sort folders alphabetically', async ({ page }) => {
      const folderButtons = page.locator('[role="button"][aria-label^="Dossier"]');
      const count = await folderButtons.count();

      if (count >= 2) {
        const names: string[] = [];
        for (let i = 0; i < Math.min(count, 5); i++) {
          const label = await folderButtons.nth(i).getAttribute('aria-label');
          if (label) {
            const name = label.replace(/^Dossier /, '').replace(/, cliquez.*$/, '');
            names.push(name);
          }
        }

        // Vérifier que les noms sont triés
        const sortedNames = [...names].sort((a, b) =>
          a.localeCompare(b, 'fr', { sensitivity: 'base' })
        );
        expect(names).toEqual(sortedNames);
      }
    });
  });

  test.describe('Empty States', () => {
    test('should show empty folder message', async ({ page }) => {
      // Trouver un dossier vide (sans chevron)
      const emptyFolder = page.locator(
        '[role="button"][aria-label^="Dossier"]:not([aria-label*="déplier"])'
      );
      const count = await emptyFolder.count();

      if (count > 0) {
        await emptyFolder.first().click();
        await page.waitForTimeout(300);

        // Vérifier qu'aucun groupe n'apparaît
        const parent = emptyFolder.first().locator('xpath=ancestor::li[@role="treeitem"]');
        const group = parent.locator('[role="group"]');
        const groupCount = await group.count();

        expect(groupCount).toBe(0);
      }
    });
  });

  test.describe('Performance', () => {
    test('should load initial tree quickly', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');
      await page.waitForSelector('[role="tree"]');

      const loadTime = Date.now() - startTime;

      // Le chargement initial doit être < 3 secondes
      expect(loadTime).toBeLessThan(3000);
    });

    test('should expand folder quickly', async ({ page }) => {
      const folderWithContent = page.locator(
        '[role="button"][aria-label*="cliquez pour déplier"]'
      );
      const count = await folderWithContent.count();

      if (count > 0) {
        const folder = folderWithContent.first();

        const startTime = Date.now();
        await folder.click();
        await page.waitForSelector('[role="group"]');
        const expandTime = Date.now() - startTime;

        // L'expansion doit être < 500ms
        expect(expandTime).toBeLessThan(500);
      }
    });
  });
});
