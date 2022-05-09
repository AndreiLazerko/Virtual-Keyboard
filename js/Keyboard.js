/* eslint-disable function-call-argument-newline */
/* eslint-disable import/extensions */
/* eslint-disable no-param-reassign */

// Импортируем все js ранные в один файл
import * as storage from './storage.js';
import create from './utilits/create.js';
import language from './language/import.js';
import Key from './Key.js';

// Оболочка страницы
const main = create(
  'main',
  '',
  [create('h1', 'title', 'RSS Scool'),
    create('h3', 'subtitle', 'Клавиатура на JS'),
    create('p', 'hint', 'Переключение языка Alt и Shift, реализованно на Windows.')],
);

// создаем класс
export default class Keyboard {
  // конструктор по клавиатуре rowsOrder
  constructor(rowsOrder) {
    this.rowsOrder = rowsOrder; //оболочка клавиатуре
    this.keysPressed = {}; //нажатые кнопки по коду, отслеживаем 
    this.isCaps = false; //флаг , что не нажат CAPS
  }

  // init - Замыкание — это комбинация функции и лексического окружения, в котором эта функция была определена.
  // Запускаем функцию
  init(langCode) {
    this.keyBase = language[langCode]; //записали какой язык
    // Окно TEXTAREA
    this.output = create( 
      'textarea',  //тег
      'output',  //класс
      null, // нету child
      main,  //Родители
      ['placeholder', 'Что напичатаем...'], //атрибуты Окно TEXTAREA
      ['row', 5],
      ['cow', 50],
      ['spellchech', false],
      ['autocorrect', 'off'],
    );
    // Контейнер для клавиатуры
    this.container = create('div', 'keyboard', null, main, ['language', langCode]);
    // prepend - позволяет вставить в начало какого-либо элемента другой элемент.
    // Записываем в DOM
    document.body.prepend(main);
    // Возвращаем значение функции
    return this;
  }

  // Функция отрисовки
  generateLayout() {
    this.keyButtons = [];// Будут лежать кнопки (Вспомогательный массив)
    //  перебираем массив по ряду кнопок(row) и номер (i)
    this.rowsOrder.forEach((row, i) => {

      const rowElement = create('div', 'keyboard__row', null, this.container, ['row', i + 1]); // Ряды клавиатуры
      rowElement.style.gridTemplateColumns = `repeat(${row.length}, 1fr)`; // определяем равное растояние для кнопок (через grid)
      // перебираем кода кнопок
      row.forEach((code) => {    //  Итырируемся по массиву
        const keyObj = this.keyBase.find((key) => key.code === code);
        // из массива с языками ищет код и выдает первый найденный той кнопки, что нажали
        if (keyObj) { //Проверяем получили ли код кнопки
          const keyButton = new Key(keyObj); //Сама кнопка
          this.keyButtons.push(keyButton); //добавляем в конец массива keyButtons кнопку
          rowElement.appendChild(keyButton.div); // добавляем div с кнопкой
        }
      });
    });

    // Основные события нажатия и отжатия кнопки клавы и мыши
    document.addEventListener('keydown', this.handleEvent); //нажатия клавы
    document.addEventListener('keyup', this.handleEvent); //отжатия клавы
    this.container.onmousedown = this.preHandleEvent;//нажатия мыши 
    this.container.onmouseup = this.preHandleEvent;//отжатия мыши
  }

// Нажатия Мыши
  preHandleEvent = (e) => {
    e.stopPropagation();
    const keyDiv = e.target.closest('.keyboard__key');
    if(!keyDiv) return;
    const {dataset: { code } } = keyDiv;
    // const code = keyDiv.dataset.code;
    
    this.handleEvent({code, type: e.type});

    if ((!code.match(/Caps/)) && (!code.match(/Shift/))  && (!code.match(/Alt/)) ){
      keyDiv.addEventListener('mouseleave', this.resetButtonState);
       }
  };
  

  resetButtonState = ({target: { dataset: {code} } }) => {
    const keyObj = this.keyButtons.find((key) => key.code === code);
    keyObj.div.classList.remove('active');
    keyObj.div.removeEventListener('mouseleave', this.resetButtonState);
    
  }

  // функция активное нажатия кнопки
  handleEvent = (e) => {
    // отмена дефолтного события (дольнейшее события всплытия)
    if (e.stopPropagation) e.stopPropagation();
    // к приходяней нажатой кнопке происходит кейдаун и начинает вызываться колбек
    const { code, type } = e;  //видим какая кнопка нажата
    // ищем объект нажатую кнопку и возвращаем ее код
    const keyObj = this.keyButtons.find((key) => key.code === code);
    if (!keyObj) return;  //если нажали не описанную кнопку
    this.output.focus(); 

    // в типе лежит строка (клавы и мыши нажания)
    if (type.match(/keydown|mousedown/)) {
      if (type.match(/key/)) e.preventDefault(); //предотвращаем стандартные поведения

      if(code.match(/Shift/)) this.shiftKey = true; //флаг при нажатой клавиши Шифт

      if (this.shiftKey) this.switchUpperCase(true);  // Передаем флаг для поднятия регистра

      keyObj.div.classList.add('active'); //подсвечиваем кнопку классом

      if (code.match(/Caps/) && !this.isCaps) { // активный класс нажатой кнопки CAPS
        this.isCaps = true;
        this.switchUpperCase(true);
      } else if (code.match(/Caps/) && this.isCaps){ //снимаем активный класс нажатой кнопки CAPS
        this.isCaps = false;
        this.switchUpperCase(false);
        keyObj.div.classList.remove('active');
      }

      // переключаем клавиатуру сочетанием клавишь
      if(code.match(/Shift/)) this.ctrlKey = true;//флаг при нажатой клавиши Шифт
      if(code.match(/Alt/)) this.altKey = true;//флаг при нажатой клавиши Альт

      if (code.match(/Shift/) && this.altKey) this.switchLanguage();
      if (code.match(/Alt/) && this.ctrlKey) this.switchLanguage();

      // отпускаем кнопку и записываем символ
      if(!this.isCaps) {
        this.printToOutput(keyObj, this.shiftKey ? keyObj.shift : keyObj.small);
      } else if (this.isCaps) {
        if (this.shiftKey) {
          this.printToOutput(keyObj, keyObj.sub.innerHTML ? keyObj.shift : keyObj.small);
        } else {
          this.printToOutput(keyObj, !keyObj.sub.innerHTML ? keyObj.shift : keyObj.small);
        }
      }
    } else if (type.match(/keyup|mouseup/)) { //проверяем не нажат ли КАПС
      if (!code.match(/Caps/)) keyObj.div.classList.remove('active');

      if(code.match(/Shift/)) { // Приходит маленикие символы, если зажат ШИФТ
        this.shiftKey = false;
        this.switchUpperCase(false);
      }

      if(code.match(/Control/)) this.ctrlKey = false; //Флаг
      if(code.match(/Alt/)) this.altKey = false; //Флаг
    }
  }

  // смена языка
  switchLanguage = () => {
    const langAbbr = Object.keys(language); // принимаем языки в массиве ['en', 'ru']
    // определяем язык
    let langIdx = langAbbr.indexOf(this.container.dataset.language); // индекс массива 1 ru

    // новый массив языка (проенарно), меняется через индекс массивов языков
    this.keyBase = langIdx + 1 < langAbbr.length ? language[langAbbr[langIdx +=1]]
      : language[langAbbr[langIdx -= langIdx]];

      // передаем для записи индекс языка, для переключение
      this.container.dataset.language = langAbbr[langIdx];
      storage.set('kbLang', langAbbr[langIdx]); //записываем в localStorage, для сохранения при перезагрузке

      this.keyButtons.forEach((button) => {//получаем кнопку из инстонсов кнопок
        // получили новый массив keyBase и найди объект изапиши keyBase в keyObj
        const keyObj = this.keyBase.find((key) => key.code === button.code);
        if(!keyObj) return; // если ничего не нашло
        button.shift = keyObj.shift; // перезаписываем shift объект кнопки
        button.small = keyObj.small; // перезаписываем small объект кнопки
        
        // меняем в самой клавиатуре значения( отсеиваем функциональные кнопки и все кроме a-zA-Zа-яА-ЯёЁ0-9) - у них нет спец символов
        if (keyObj.shift && keyObj.shift.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/g)){
          button.sub.innerHTML = keyObj.shift; //перезаписываем shift(sub) объект кнопки в html
        } else {
          button.sub.innerHTML = '';
        }
        button.letter.innerHTML = keyObj.small;//перезаписываем shift(letter - основной символ) объект кнопки в html
      });

      if (this.isCaps) this.switchUpperCase(true); // если нажат CAPS 
  }

  // Поднимаем регистр SHIFT (перерисовка клавиатуры)
  switchUpperCase(isTrue) {
    if (isTrue) { //если флаг шифта пришло true
      this.keyButtons.forEach((button) => {//получаем кнопку
        if (button.sub) { //есть ли у кнопки спец символ
          if(this.shiftKey) { //если это не CAPS, то добавляем КЛАССЫ(стили)
            button.sub.classList.add('sub-active');
            button.letter.classList.add('sub-inactive');
          }
        }

        // мы не трогаем функц кнопки и зажат КАПС и не зажат Шифт и не пустой sub.innerHTML
        if (!button.isFnKey && this.isCaps && !this.shiftKey && !button.sub.innerHTML) {
          button.letter.innerHTML = button.shift; // меняем HTML основной символ , на поднятый регистр
        } else if (!button.isFnKey && this.isCaps && this.shiftKey) { // если зажали при этом ШИФТ
          button.letter.innerHTML = button.small; // переписали на младший регистр
        } else if (!button.isFnKey && !button.sub.innerHTML) {
          button.letter.innerHTML = button.shift;
        } 
      });
    } else { //отпускаем кнопки 
      this.keyButtons.forEach((button) => {
        if(button.sub.innerHTML && !button.isFnKey) { // удаляем стили для кнопок
          button.sub.classList.remove('sub-active');
          button.letter.classList.remove('sub-inactive');

          // и возвращаем основные символы
          if (!this.isCaps) {
            button.letter.innerHTML = button.small;
          } else if (!this.isCaps) {
            button.letter.innerHTML = button.shift;
          }
        } else if (!button.isFnKey) {
          if (this.isCaps) {
            button.letter.innerHTML = button.shift;
          } else {
            button.letter.innerHTML = button.small;
          }
        }
      });
    }
  }

  // вывод в OUTPUL
  printToOutput(keyObj, symbol) {
    let cursorPos = this.output.selectionStart;  //Позиция курсова при помощи selectionStart-дает число
    const left = this.output.value.slice(0, cursorPos); //левая часть от курсора
    const right = this.output.value.slice(cursorPos); //правая часть от курсора

    const fnButtonsHandler = {  //функциональные кнопки
      Tab: () => {  //ТАВ -- 2 пробела
        this.output.value = `${left}\t${right}`;
        cursorPos += 1;
      },
      ArrowLeft: () => { //стрелка лево (если мы может отнять от позиции курсора левую часть) и идет сдвиг
        cursorPos = cursorPos - 1 >= 0 ? cursorPos -1 : 0;
      },
      ArrowRight: () => { //стрелка право 
        cursorPos = cursorPos + 1;
      },
      ArrowUp: () => { //стрелка вверх (ижем перенос строки) берем всё слево до первого переноса строки \n или на один сдвигаем
        const positionFromLeft = this.output.value.slice(0, cursorPos).match(/(\n).*$(?!\1)/g) || [[1]];
        cursorPos -= positionFromLeft[0].length;
      },
      ArrowDown: () => { //стрелка вниз
        const positionFromLeft = this.output.value.slice(cursorPos).match(/^.*(\n).*$(?!\1)/) || [[1]];
        cursorPos += positionFromLeft[0].length;
      },
      Enter: () => { //Enter - \n 
        this.output.value = `${left}\n${right}`;
        cursorPos +=1;
      },
      Delete: () => { //удаляем один символ справа
        this.output.value = `${left}${right.slice(1)}`;
      },
      Backspace: () => { //удаляем один символ слево
        this.output.value = `${left.slice(0, -1)}${right}`;
        cursorPos -=1;
      },
      Space: () => { 
        this.output.value = `${left} ${right}`;
        cursorPos +=1;
      }
    }

    // проверяем есть ли в ключах код(функциональных)
    if (fnButtonsHandler[keyObj.code]) fnButtonsHandler[keyObj.code]();
    else if (!keyObj.isFnKey) {
      cursorPos +=1;  //сдвигаем курсор на +1
      this.output.value = `${left}${symbol || ''}${right}`;  //вставляем символ и берем позицию справа и слево курсора
    }
    this.output.setSelectionRange(cursorPos, cursorPos); //обнавляем позицию курсора
  }
}
