import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizePhone, formatPhoneInput, validateForm, collectionReady, allowedUrl, confirmedRegistration, attribution} from '../public/static/webinar/form-core.mjs';
test('Telefone brasileiro aceita formatos comuns e rejeita incompletos',()=>{
  assert.equal(normalizePhone('(11) 99999-1234'),'5511999991234');
  assert.equal(normalizePhone('+55 11 99999-1234'),'5511999991234');
  for (const phone of ['', '1199991234', '0011999991234']) assert.equal(normalizePhone(phone),null);
});
test('Máscara aceita só números, até 11 dígitos, no formato brasileiro',()=>{
  const casos=[['',''],['abc',''],['1','(1'],['11','(11'],['119','(11) 9'],['1199999','(11) 99999'],['11999991','(11) 99999-1'],
    ['11999991234','(11) 99999-1234'],['119999912345678','(11) 99999-1234'],['abc11999991234xyz','(11) 99999-1234'],
    ['+55 11 99999-1234','(11) 99999-1234'],['5511999991234','(11) 99999-1234'],['011999991234','(11) 99999-1234'],
    ['55999991234','(55) 99999-1234'],['559999912345','(55) 99999-1234']];
  for (const [entrada,esperado] of casos) assert.equal(formatPhoneInput(entrada),esperado);
  assert.equal(normalizePhone(formatPhoneInput('abc11999991234xyz')),'5511999991234');
});
test('Nome e consentimento são obrigatórios',()=>{
  assert.deepEqual(validateForm({name:'  João   Silva ',phone:'11999991234',consent:true}).errors,{});
  assert.ok(validateForm({name:'a1',phone:'11999991234',consent:false}).errors.name);
  assert.ok(validateForm({name:'João',phone:'11999991234',consent:false}).errors.consent);
});
test('Cadastro exige ativação explícita e configuração completa',()=>{
  const complete={mode:'live',registrationOpen:true,dateConfirmed:true,endpoint:'https://example.com/webinar',privacyContact:'Equipe Delivery Elite'};
  assert.equal(collectionReady(complete),true);
  for(const [key,value] of [['mode','preview'],['registrationOpen',false],['dateConfirmed',false],['endpoint','']]) assert.equal(collectionReady({...complete,[key]:value}),false);
});
test('HTTP 200 sem comprovante não confirma inscrição',()=>{
  for(const data of [{},{ok:true},{ok:true,registrationId:''},{ok:false,registrationId:'id'}]) assert.equal(confirmedRegistration({ok:true},data),false);
  assert.equal(confirmedRegistration({ok:false},{ok:true,registrationId:'id'}),false);
  assert.equal(confirmedRegistration({ok:true},{ok:true,registrationId:'id'}),true);
});
test('Links de destino rejeitam esquemas e hosts inesperados',()=>{
  assert.equal(allowedUrl('javascript:alert(1)','group'),'');
  assert.equal(allowedUrl('https://chat.whatsapp.com.evil.test/invite','group'),'');
  assert.equal(allowedUrl('https://youtube.com@evil.test','live'),'');
  assert.equal(allowedUrl('https://chat.whatsapp.com/Exemplo','group'),'https://chat.whatsapp.com/Exemplo');
});
test('Atribuição mantém somente campos previstos',()=>{
  assert.deepEqual(attribution('?name=Joao&whatsapp=123&utm_source=meta'),{utm_source:'meta'});
});
