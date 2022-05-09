/* eslint-disable import/prefer-default-export */
// записываем в localstoreg
export function set(name, value) {
  // JSON.stringify(value) - переобразован в строку
  window.localStorage.setItem(name, JSON.stringify(value));
}

// получаем из localstoreg
export function get(name, subst = null) {
  //  JSON.parse - обратно приведет в объект из строки ()
  return JSON.parse(window.localStorage.getItem(name) || subst);
}

// удаляем localstoreg
export function remove(name) {
  window.localStorage.removeItem(name);
}
