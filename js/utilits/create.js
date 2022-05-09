/** //Какие параметры принимает функция
  *@param {String} el
  *@param {String} classNames
  *@param {HTMLElement} child
  *@param {HTMLElement} parent
  *@param {...array} dataAttr
  */
// Кастомная обертка 
// Определяем функцию
export default function create(el, classNames, child, parent, ...dataAttr) { // dataAttr - атрибуты функции
  let element = null;
  try { // try - catch  -- попробуй выполни, если ошибка (будет не el - а h1 или div) то перехвоти ее или напиши ЕЕ
    element = document.createElement(el);
  } catch (error) { // обратотали ошибку
    throw new Error('Unable to creat HTMLElement! Give a proper tag name');
  }

  if (classNames) {
    element.classList.add(...classNames.split(' '));// создадим массив из классов (спред оператор)
  }
  // Преверка CHILD - передали какой-нибудь аргумент (массив html элементов)  
  // Метод appendChild позволяет вставить в конец какого-либо другой элемент.
  if (child && Array.isArray(child)) {
    // обращаемся к каждому элементу массива и проверяем саму себя
    child.forEach((childElement) => childElement && element.appendChild(childElement));
  } else if (child && typeof child === 'object') {
    // если передан объект
    element.appendChild(child);
  } else if (child && typeof child === 'string') {
    // если передана страка
    element.innerHTML = child;
  }
// Проверка PARENT - проверяем , что что-то передали
  if (parent) {
    parent.appendChild(element);
  }
// Проверяем DataATTR - если собранный массив(переданы аргументы) ['id', 'menu'], ['code', 'code кнорки']
  if (dataAttr.length) {
    // Деструктуризация – это особый синтаксис присваивания, при котором можно присвоить массив или объект сразу нескольким переменным, разбив его на части.
    // первый атрибут - положется в attrName, первый атрибут - положется в attrValue
    dataAttr.forEach(([attrName, attrValue]) => {
      // если одиночный атрибут
      if (attrValue === '') {
        element.setAttribute(attrName, '');
      }
      // регулярные выражения - приведение типов .match(/value|id|placeholder|cols|rows|autocorrect|spellcheck/) - 
      if (attrName.match(/value|id|placeholder|cols|rows|autocorrect|spellcheck/)) {
        element.setAttribute(attrName, attrValue);
      } else {
        // пришел DATA атрибут
        element.dataset[attrName] = attrValue;
      }
    });
  }
  // Возвращаем элемент element
  return element;
}
