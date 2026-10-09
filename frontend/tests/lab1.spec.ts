import { test, expect } from '@playwright/test';

test('new owner can register, configure and open a tailored workspace', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Создайте аккаунт' })).toBeVisible();
  await page.getByLabel('Ваше имя').fill('Тимур');
  await page.getByLabel('Рабочая почта').fill('timur@example.ru');
  await page.getByLabel('Пароль').fill('password123');
  await page.getByLabel('Название бизнеса').fill('Школа «Импульс»');
  await page.getByRole('button', { name: 'Продолжить' }).click();
  await expect(page.getByRole('heading', { name: /Чем занимается ваш бизнес/ })).toBeVisible();
  await page.getByRole('button', { name: /Спорт/ }).click();
  await page.getByLabel(/Расскажите немного/).fill('Детская футбольная секция. Нужны группы, посещаемость и контроль оплат.');
  await page.getByRole('button', { name: 'Предложить структуру' }).click();
  await expect(page).toHaveURL(/\/configure$/);
  await expect(page.getByRole('heading', { name: /Вот что поможет держать/ })).toBeVisible();
  await expect(page.getByText('Сущности', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Подтвердить конфигурацию' }).click();
  await expect(page.getByRole('heading', { name: 'Ваша система готова' })).toBeVisible();
  await page.getByRole('button', { name: 'Перейти в систему' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: /Доброе утро, Тимур/ })).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Группы' })).toBeVisible();
  await page.getByRole('navigation').getByRole('link', { name: 'Клиенты' }).click();
  await page.getByRole('button', { name: 'Добавить клиента' }).click();
  await page.getByLabel('Имя', { exact: true }).fill('Анна Смирнова');
  await page.getByLabel('Телефон').fill('+79990000000');
  await page.getByLabel('Email').fill('anna@example.ru');
  await page.getByLabel('Группа или сегмент').fill('Группа А');
  await page.getByRole('button', { name: 'Сохранить клиента' }).click();
  await expect(page.getByText('Анна Смирнова')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Анна Смирнова')).toBeVisible();
  expect(errors).toEqual([]);
});

test('workspace navigation, tasks, automations and mobile layout work', async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('flowbiz.workspace.v1')) return;
    localStorage.setItem('flowbiz.registration.v1', JSON.stringify({ ownerName: 'Алексей', email: 'a@example.ru', businessName: 'Студия Баланс' }));
    localStorage.setItem('flowbiz.workspace.v1', JSON.stringify({
      setup: { ownerName:'Алексей',email:'a@example.ru',businessName:'Студия Баланс',workspaceName:'Студия Баланс',category:'wellness',description:'Массажная студия',createdAt:new Date().toISOString(),
        entities:[{id:'clients',name:'Клиент',plural:'Клиенты',section:'clients',enabled:true,fields:[]},{id:'documents',name:'Документ',plural:'Документы',section:'documents',enabled:true,fields:[]},{id:'tasks',name:'Задача',plural:'Задачи',section:'tasks',enabled:true,fields:[]},{id:'automations',name:'Правило',plural:'Автоматизации',section:'automations',enabled:true,fields:[]}],
        processes:[],automations:[{id:'a',title:'Напоминание о записи',detail:'Напомнить клиенту за день',enabled:true}] },
      data:{ clients:[{id:'c1',name:'Мария Волкова',contact:'+7 900 000-00-00',email:'m@example.ru',status:'active',segment:'Постоянный клиент',updatedAt:'2026-10-06',note:'Заметка'}],schedule:[],groups:[],team:[],payments:[],documents:[],tasks:[{id:'t1',title:'Позвонить клиенту',detail:'Уточнить время',due:'2026-10-07',priority:'high',done:false}] }
    }));
  });
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.getByRole('heading',{name:/Доброе утро, Алексей/})).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Открыть меню'}).click();
  await page.getByRole('navigation').getByRole('link',{name:'Задачи'}).click();
  await page.getByLabel('Отметить выполненным').check();
  await page.reload();
  await expect(page.getByLabel('Отметить выполненным')).toBeChecked();
  await page.getByRole('button',{name:'Открыть меню'}).click();
  await page.getByRole('navigation').getByRole('link',{name:'Автоматизации'}).click();
  await page.getByRole('button',{name:'Отключить автоматизацию'}).click();
  await page.reload();
  await expect(page.getByRole('button',{name:'Включить автоматизацию'})).toBeVisible();
});

test('setup recovers from invalid local data and section visibility is configurable', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('flowbiz.workspace.v1','{broken'));
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Создайте аккаунт'})).toBeVisible();
  await page.getByLabel('Ваше имя').fill('Анна');
  await page.getByLabel('Рабочая почта').fill('anna@example.ru');
  await page.getByLabel('Пароль').fill('password123');
  await page.getByLabel('Название бизнеса').fill('Секция');
  await page.getByRole('button',{name:'Продолжить'}).click();
  await page.getByRole('button',{name:'Предложить структуру'}).click();
  await page.getByRole('button',{name:'Подтвердить конфигурацию'}).click();
  await page.getByRole('button',{name:'Перейти в систему'}).click();
  await page.getByRole('navigation').getByRole('link',{name:'Настроить бизнес'}).click();
  await page.getByRole('button',{name:'Разделы'}).click();
  await page.getByRole('button',{name:/Скрыть раздел Документы/}).click();
  await expect(page.getByRole('navigation').getByRole('link',{name:'Документы'})).toHaveCount(0);
});
