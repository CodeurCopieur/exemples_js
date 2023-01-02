
 
 
  // local storage
  class Storage {
    static saveComponents(products) {
      localStorage.setItem('components', JSON.stringify(products));
    }

    static getComponent(id) {
      let components = JSON.parse(localStorage.getItem('components'));
      return components.find( component => component.dataId === id );
    }
  }

  function createDivWithClass(className) {
    let div = document.createElement('div');
    div.className = className;

    return div;
  }

  
  let urlJson = "./components.json?" + new Date().getTime();
    getComponents(urlJson)

    async function getComponents(url) {
      lastUrl = url;

      try {

        await fetch(url)
        .then( data => data.json())
        .then( data => {
          if(data){
            Storage.saveComponents(data.Components);
          }
        })
      } catch(error) {
        console.error(error)
      }
    }

    var allComponents = Array.prototype.slice.call(document.querySelectorAll('.stl_section'));

    let componentsLocal = JSON.parse(localStorage.getItem('components'));

    document.addEventListener('DOMContentLoaded', ()=> {

       /*
     Selectionner tous les éléments avec un attribute title
     Lorsque l'on clique sur un de ces élèment
     On crée une bulle
     On place cette bulle au desssu de l'élément
     Animer l'apparition de cette bulle
     Lorsque l'on quitte le survol de l'élément
     Animer la disparition de l'élément
     Supprimer la tooltip du DOM
    */

   /**
    * Applique le système de bulle d'infos sur les éléments
    * @param {string} selector
    */
    class Tooltip {
      static bind( selector ) {
        document.querySelectorAll(selector).forEach( element =>  { 
          new Tooltip(element); 
          console.log(typeof element)
        })
      }

      constructor(element) {
        this.element = element
        this.tooltip = null
        this.element.addEventListener('click', this.clickOver.bind(this))
        this.element.addEventListener('mouseout', this.mouseOut.bind(this))
      }


      clickOver() {
        // debugger
        let tooltip = this.createTooltip();
        let w = this.tooltip.offsetWidth;
        let h = this.tooltip.offsetHeight;

        // let l = this.element.offsetWidth / 2 - w / 2 + this.element.getBoundingClientRect().left + document.documentElement.scrollLeft - 50;
        let t = this.element.getBoundingClientRect().top - h - 15 + document.documentElement.scrollTop
        // tooltip.style.left = l+'px'
        tooltip.style.top = t+'px'

        tooltip.classList.add('visible')
        this.element.classList.add('active')
      }

      mouseOut() {
        if(this.tooltip !== null) {
          setTimeout(()=> {
            this.tooltip.classList.remove('visible')
            this.tooltip.addEventListener('transitionend', ()=> {
              this.tooltip.remove()
              // var elem = document.qu("myDiv");
              // document.body.removeChild(this.tooltip)
              setTimeout(()=> {this.tooltip = null; this.element.classList.remove('active')}, 10)
            })
          }, 100)
        }
      }

      /**
       * Créer et injecté la bulle d'info dans le HTML
       * @returns { HTMLElement }
       */

      createTooltip() {
        if(this.tooltip === null) {
          let tooltip = createDivWithClass('component__tooltip');
          tooltip.innerHTML = 'Copié'
          document.body.appendChild(tooltip)
          this.tooltip = tooltip
        }

        return this.tooltip
      }
    }
      
      allComponents.forEach(myFunc)
      Tooltip.bind('.di-clipboard button')
      function myFunc(item, index, arr) {
  
        // item.setAttribute('data-id', 'id'+index)
        var containerDiv = createDivWithClass('container__component');
  
        item.insertAdjacentElement('beforebegin', containerDiv);
        containerDiv.insertAdjacentHTML('afterbegin', '<div class="di-clipboard"><small>HTML</small><button type="button"  data-id="id'+ index +'" class="btn-clipboard"><svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="stroked" viewBox="0 0 24 24" width="32" height="32" stroke-miterlimit="1.5" fill="none"><path d="m4.657 10.236 6.138 6.341 9.54-9.885" stroke="#fff" stroke-width="3"/></svg></button></div>')
        containerDiv.insertAdjacentElement('beforeend', item)
  
        clipboard = containerDiv.querySelector('.di-clipboard')


        


  
        clipboard.addEventListener('click', function(e) {
          e.preventDefault();
          var currentTarget = e.currentTarget;
          var idLibelle = currentTarget.querySelector('[data-id]').getAttribute('data-id');
  
          valid = Storage.getComponent(idLibelle)
  
          function aenu(chn) {
            return decodeURIComponent(escape(window.atob(chn)));
          }
  
          if(valid) {
            // var contentHtml = aenu(valid.base64);
            navigator.clipboard.writeText(aenu(valid.base64))
  
          } else {
            console.log('naaaaaaah');
          }
        })
  
      } 

    })

