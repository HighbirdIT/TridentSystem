const PAGE_LOADED = 'PAGE_LOADED';

function makeActionCreator(type, ...argNames) {
    return function(...args) {
      let action = { type };
      argNames.forEach((arg, index) => {
        action[argNames[index]] = args[index]
      });
      return action;
    }
}
  
const CLICK_ADD = 'CLICK_ADD';
  
const clickItem = makeActionCreator(CLICK_ADD, 'keke');