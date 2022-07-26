import Modal from './modal';
import {debounce} from 'lodash';


let isCustomkeydownListened = false;
let word = '';

export default {
    init($el) {
        this.modal = new Modal();
        this.closeButton = document.querySelector('.component-modal__close');
        this.lang   = document.documentElement.getAttribute('lang');

        this.lang == 'fr' ? word = 'Plus de résultats' : word = 'More results';

        this.template =
        `
            <div  class="component-modal__search--template-container path-search">
                <form class="component-modal__search--form">
                    <input class="component-modal__search--input" placeholder="search" type="text"/>
                    <div class="component-modal__search--counter"></div>
                </form>

                <img class="component-modal__search--loader" src="/themes/custom/numero/img/loader.gif">

                <div class="component-modal__search--results">
                    <ul class="component-modal__search--results-list block-grid__grid"></ul>
                    <div class="component-modal__search--submit" data-url="/${$el.dataset.url}">
                        <span aria-hidden="true"></span>
                         ${word}
                    </div>
                </div>
            </div> 
        `;

        const modalCallback = () => {
            this.loaderEl = document.querySelector('.component-modal__search--loader');
            this.inputEl = document.querySelector('.component-modal__search--input');
            this.resultsEl = document.querySelector('.component-modal__search--results-list');
            this.counterEl = document.querySelector('.component-modal__search--counter');
            this.submitEl = document.querySelector('.component-modal__search--submit');
            this.formEl = document.querySelector('.component-modal__search--form');
            

            this.inputEl.addEventListener('keyup', this.debouncedPreviewSearch);
            this.submitEl.addEventListener('click', this.submitSearch);
            this.formEl.addEventListener('submit', this.subSearch);
        };

        $el.addEventListener('click', () => {
            this.modal.buildModal(this.template, 'Close', modalCallback);
        });

        this.renderResponse = this.renderResponse.bind(this);
        this.previewSearch = this.previewSearch.bind(this);


        this.debouncedPreviewSearch = debounce((e) => {

            if(e.target.value.trim().length === 0) {
                return;
            }
            
            this.previewSearch(e.target.value);

        }, 200);

        this.subSearch = (e)=> {
            e.preventDefault();
            this.submitSearch();
            this.modal.handleDestroyModal();
        };
    },

    previewSearch(value) {
        this.resultsEl.innerHTML = '';
        this.counterEl.innerHTML = '';
        this.submitEl.classList.remove('visible');
        
        const urlSuffix = '/search-json?keys=';
        const url = window.location.origin + "/" + `${this.lang}` + urlSuffix + value;
        
        
        fetch(url)
        .then(response => response.json())
        .then(jsonData => {
            
            const results = jsonData.map( elt => elt);
            results ? this.renderResponse(results) : null;
        })
        .catch((error) => {
            this.loaderEl.classList.remove('visible');
            if(value.length > 2) {
                this.loaderEl.classList.add('visible');
            }
        });
    },

    submitSearch() {
        const urlSuffix = '/search/articles?keys=';
        let inputEl = document.querySelector('.component-modal__search--input').value;
        
        if (inputEl.length) {
            window.location = window.location.origin + "/" + document.documentElement.getAttribute('lang') + urlSuffix + inputEl + `&lang=${this.lang}&page=1` ;
        }
    },

    renderResponse(response) {

        this.loaderEl.classList.remove('visible');
        this.submitEl.classList.add('visible');

        response ? this.renderResults(response) : null;
        this.counterEl.innerHTML = `${response.length} results`;
    },

    renderResults(articles) {

        this.resultsEl.innerHTML = (
            articles.map( article => (
                `
                <li class="block-grid__grid--item">
                    <a class="component-card small-card small-card--search" href="${article.link}">
                        <span class="component-card__number">${article.article_date[0]}${article.article_date[1]}</span>
                        <picture>
                            <img class="covered component-card__image" alt="" src="${article.image_push}" width="" height="">
                        </picture>
                        <div class="component-card__content--container">
                            <span class="taxonomy">${article.category}</span>
                            <h3 class="component-card__content--title">${article.title}</h3>
                            <span class="component-card__content--date"><span>${article.article_date}</span></span>
                        </div>
                        
                    </a>
                </li>   
                `
            )).join('')
        );
        
    }
};