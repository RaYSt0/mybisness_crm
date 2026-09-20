import { test, expect } from '@playwright/test';

const completedConfig = {
  organizationName: 'Студия «Ритм»',
  ownerName: 'Тимур',
  ownerEmail: 'timur@example.com',
  presetId: 'dance',
  enabledModules: ['subscriptions', 'scheduling', 'finance'],
  isOnboardingCompleted: true,
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((config) => {
    if (!localStorage.getItem('mybusiness:business-config:v2')) {
      localStorage.setItem('mybusiness:business-config:v2', JSON.stringify(config));
    }
  }, completedConfig);
});

const screens = [
  ['/', 'Студия «Ритм»', 'dashboard'],
  ['/students', 'Ученики', 'students'],
  ['/students/1', 'Иван Иванов', 'student-profile'],
  ['/students/new', 'Добавить ученика', 'student-create'],
  ['/students/1/edit', 'Редактировать ученика', 'student-edit'],
  ['/constructor', 'Настройка CRM «Студия «Ритм»»', 'constructor-step-1'],
  ['/finance', 'Финансы', 'finance'],
  ['/settings', 'Команда и права доступа', 'settings'],
  ['/help', 'Помощь', 'help'],
  ['/missing', 'Страница не найдена', 'not-found'],
];

test('all pages load directly and fit desktop and mobile screens', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [path, heading, name] of screens) {
      await page.goto(path);
      await expect(page.getByRole('heading', { name: heading, exact: true }).last()).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `docs/screenshots/${name}${width === 390 ? '-mobile' : ''}.png`, fullPage: true, animations: 'disabled' });
    }
  }
  expect(errors).toEqual([]);
});

test('navigation, search, profile tabs, configuration persistence and role details', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: 'Ученики', exact: true }).click();
  await expect(page).toHaveURL(/\/students$/);
  await page.getByLabel('Поиск по имени или группе').fill('Несуществующий');
  await expect(page.getByRole('status')).toHaveText('Найдено учеников: 0');
  await page.getByRole('button', { name: 'Сбросить поиск' }).click();
  await page.getByRole('link', { name: 'Открыть карточку' }).click();
  await expect(page).toHaveURL(/\/students\/1$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Иван Иванов', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/students$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/students\/1$/);
  for (const [tab, heading, name] of [['Посещаемость', 'История посещений', 'attendance'], ['Платежи', 'История платежей', 'payments']]) {
    await page.getByRole('button', { name: tab, exact: true }).click();
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    await page.screenshot({ path: `docs/screenshots/student-${name}.png`, fullPage: true, animations: 'disabled' });
  }
  await page.getByRole('navigation').getByRole('link', { name: 'Настройки', exact: true }).click();
  await page.getByRole('link', { name: 'Изменить модули CRM' }).click();
  await page.getByRole('button', { name: /Спортивная секция/ }).click();
  await page.getByRole('button', { name: 'Далее' }).click();
  await page.getByRole('switch', { name: 'Мед-карты', exact: true }).check();
  await page.getByRole('switch', { name: 'Финансы', exact: true }).uncheck();
  await page.screenshot({ path: 'docs/screenshots/constructor-step-2.png', fullPage: true, animations: 'disabled' });
  await page.reload();
  await page.getByRole('button', { name: 'Далее' }).click();
  await expect(page.getByRole('switch', { name: 'Финансы', exact: true })).not.toBeChecked();
  await expect(page.getByRole('switch', { name: 'Мед-карты', exact: true })).toBeChecked();
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Финансы', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Далее' }).click();
  await expect(page.getByText('Спортивная секция', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/constructor-step-3.png', fullPage: true, animations: 'disabled' });
  await page.goto('/finance');
  await expect(page.getByText(/Финансовый модуль выключен/)).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/finance-disabled.png', fullPage: true, animations: 'disabled' });
  await page.goto('/students/1');
  await page.getByRole('button', { name: 'Документы', exact: true }).click();
  await expect(page.getByText('Медицинская справка', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/student-documents.png', fullPage: true, animations: 'disabled' });
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Просмотреть права: Мария Петрова' }).click();
  await expect(page.getByText(/Просмотр прав для:/)).toContainText('Мария Петрова');
  await page.screenshot({ path: 'docs/screenshots/settings-permissions.png', fullPage: true, animations: 'disabled' });
});

test('onboarding validates registration and creates an individual CRM', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('mybusiness:business-config:v2', JSON.stringify({
    organizationName: '', ownerName: '', ownerEmail: '', presetId: 'dance',
    enabledModules: ['subscriptions', 'scheduling', 'finance'], isOnboardingCompleted: false,
  })));
  await page.goto('/students');
  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByRole('heading', { name: 'Создайте свою CRM' })).toBeVisible();
  await page.getByRole('button', { name: 'Далее' }).click();
  await expect(page.getByRole('alert')).toContainText('Укажите имя и email');
  await page.getByLabel('Ваше имя *').fill('Анна');
  await page.getByLabel('Email *').fill('anna@example.com');
  await page.getByRole('button', { name: 'Далее' }).click();
  await page.getByLabel('Название бизнеса *').fill('Школа «Импульс»');
  await page.getByRole('button', { name: 'Школа танцев' }).click();
  await page.getByRole('button', { name: 'Далее' }).click();
  await page.getByRole('switch', { name: 'Мед-карты', exact: true }).check();
  await page.getByRole('button', { name: 'Далее' }).click();
  await expect(page.getByText('Школа «Импульс»', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/onboarding-summary.png', fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'Открыть CRM' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: 'Школа «Импульс»', exact: true })).toBeVisible();
  await expect(page.locator('.app-sidebar').getByText('Школа «Импульс»', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Анна', { exact: true })).toBeVisible();
});

test('configuration recovers from corrupt browser storage', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('mybusiness:business-config:v2', '{broken'));
  await page.goto('/constructor');
  await expect(page.getByRole('heading', { name: 'Создайте свою CRM' })).toBeVisible();
  await expect(page.getByLabel('Ваше имя *')).toHaveValue('');
});

test('student creation, validation, editing, archive and restore survive reload', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto('/students');
  await page.getByRole('link', { name: 'Добавить ученика' }).click();
  await page.getByLabel('Имя ученика').fill('   ');
  await page.getByLabel('Группа', { exact: false }).fill('Группа Б');
  await page.getByRole('button', { name: 'Сохранить ученика' }).click();
  await expect(page.getByRole('alert')).toContainText('Поля не могут состоять только из пробелов');
  await page.getByLabel('Имя ученика').fill('Анна Соколова');
  await page.getByLabel('Дата рождения').fill('2999-01-01');
  await page.getByRole('button', { name: 'Сохранить ученика' }).click();
  await expect(page.getByRole('alert')).toContainText('Дата рождения не может быть в будущем');
  await page.getByLabel('Дата рождения').fill('2014-02-03');
  await page.getByLabel('Email', { exact: true }).fill('anna@example.com');
  await page.getByLabel('Заметки').fill('Пробное занятие в субботу');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'docs/screenshots/student-create-mobile.png', fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'Сохранить ученика' }).click();
  await expect(page.getByRole('heading', { name: 'Анна Соколова', exact: true })).toBeVisible();
  const profileUrl = page.url();
  await page.reload();
  await expect(page.getByText('Пробное занятие в субботу')).toBeVisible();
  await page.getByRole('button', { name: 'Посещаемость', exact: true }).click();
  await expect(page.getByText(/Посещений пока нет/)).toBeVisible();
  await page.getByRole('link', { name: 'Редактировать', exact: true }).click();
  await page.getByLabel('Имя ученика').fill('Анна Смирнова');
  await page.getByRole('button', { name: 'Сохранить ученика' }).click();
  await expect(page).toHaveURL(profileUrl);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Анна Смирнова', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'В архив', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Восстановить ученика' })).toBeVisible();
  await page.goto('/students');
  await expect(page.getByRole('heading', { name: 'Анна Смирнова' })).toHaveCount(0);
  await page.getByLabel('Статус', { exact: true }).selectOption('archived');
  await expect(page.getByRole('heading', { name: 'Анна Смирнова' })).toBeVisible();
  await page.getByRole('link', { name: 'Открыть карточку' }).click();
  await page.getByRole('button', { name: 'Восстановить ученика' }).click();
  await page.goto('/students');
  await expect(page.getByRole('status')).toHaveText('Найдено учеников: 2');
  await page.getByLabel('Поиск по имени или группе').fill('Группа Б');
  await expect(page.getByRole('status')).toHaveText('Найдено учеников: 1');
  await page.goto('/students/unknown-student');
  await expect(page.getByRole('heading', { name: 'Ученик не найден' })).toBeVisible();
});

test('student storage failures are visible and unsaved changes work in memory', async ({ page }) => {
  await page.goto('/students');
  await page.evaluate(() => localStorage.setItem('mybusiness:students:v1', '{corrupt'));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Не удалось прочитать');
  expect(await page.evaluate(() => localStorage.getItem('mybusiness:students:v1'))).toBe('{corrupt');
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('Quota exceeded'); }; });
  await page.getByRole('link', { name: 'Добавить ученика' }).click();
  await page.getByLabel('Имя ученика').fill('Тестовый ученик');
  await page.getByLabel('Группа', { exact: false }).fill('Тестовая группа');
  await page.getByRole('button', { name: 'Сохранить ученика' }).click();
  await expect(page.getByRole('heading', { name: 'Тестовый ученик', exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Не удалось сохранить');
});
