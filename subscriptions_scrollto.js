import scrollToY from 'onp:helpers/scroll_to_y';
//import __settings from 'onp:helpers/settings';

const scrollToHandler = ($el) => {

    const $linkIntro = $el.querySelectorAll('.component-subscriptions__link-scroll');

    function init(){
        addEvents();
    }

    function addEvents(){
        $linkIntro.forEach( elt => {
            elt.addEventListener('click', scrollTo);
        });            
    }

    function scrollTo(e) {
        e.preventDefault();
        const scrollToId = e.target.getAttribute('data-scroll-to');

        if(!scrollToId) {
            return;
        }

        const elDistanceToTop = window.pageYOffset + document.querySelector(scrollToId).getBoundingClientRect().top;
        const headerHeight = document.querySelector('.component-main-navigation__header').getBoundingClientRect().height;

        let delta = 100;

        scrollToY({
            el: document,
            offset: elDistanceToTop - headerHeight - delta,
            duration: 400
        });
    }

    init();

};

export default scrollToHandler;