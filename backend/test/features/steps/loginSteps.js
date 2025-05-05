const { Given, When, Then } = require('@cucumber/cucumber');
const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

let driver;

Given('que o cliente esteja na página de login', async () => {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get('http://localhost:3000/clientes/login'); // ajuste conforme sua rota real
});

When('ele preencher o e-mail com {string}', async (email) => {
    const inputEmail = await driver.findElement(By.id('email_login'));
    await inputEmail.sendKeys(email);
});

When('preencher a senha com {string}', async (senha) => {
    const inputSenha = await driver.findElement(By.id('senha_login'));
    await inputSenha.sendKeys(senha);
});

When('clicar no botão {string}', async (botaoTexto) => {
    const botao = await driver.findElement(By.css('button[type="submit"]'));
    await botao.click();
});

Then('ele deve ser redirecionado para a página de home do cliente', async () => {
    await driver.wait(until.urlContains('/clientes/home'), 5000);
    const urlAtual = await driver.getCurrentUrl();
    assert.ok(urlAtual.includes('/clientes/home'));
    await driver.quit();
});
