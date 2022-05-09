/* eslint-disable import/extensions */
import create from './utilits/create.js';
// ЭКСПОРТИРУЕМ (делали класс Key)
export default class Key {
  // конструктор класса 
  constructor({ small, shift, code }) {
    // (small, shift, code ) берем из js c языками : this.элемент - записываем его 
    this.code = code;
    this.small = small;
    this.shift = shift;
    this.isFnKey = Boolean(small.match(/Ctrl|arr|Alt|Shift|Tab|Back|Del|Enter|Caps|Win/)); // Функциональные кнопки

    // структура кнопки
    // Если есть Шифт  и он не ^(значит НЕ) .match(/[^a-zA-Zа-яА-ЯёЁ0-9]/) все что не попало под матч
    if (shift && shift.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/)) {
      // create('div', 'sub', this.shift) - div оборачиваем, даем ему класс sub и this.shift - значение шифт
      this.sub = create('div', 'sub', this.shift);
    } else {
      // кнопка без шифта
      this.sub = create('div', 'sub', '');
    }

    //  // кнопка основного символа
    this.letter = create('div', 'letter', this.small);
    // объединяем this.sub и this.lette
    this.div = create(
      'div', //контейнер
      'keyboard__key', //класс
      [this.sub, this.letter], //HTML Элементы
      null, //нет родителя(parent)
      ['code', this.code],//DATA атрибуты
      this.isFnKey ? ['fn', 'true'] : ['fn', 'false'],
    ); // стили для функциональных кнопок
  }
}
