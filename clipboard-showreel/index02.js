 document.addEventListener('DOMContentLoaded', () => {
   var componentsDOM = document.querySelector('.wrapper-components');


   /**
    * La Class Storage a 2 pour méthode :
    * saveComponents quia pour parametre un object, de plus va créer le tablaeau components dans le local Storage qui va contenir chaque object(nom, id, html)
    * getComponent qui a pour parametre un id, utilisation de la méthode find qui va retournée le composant qui l'id trouvé 
    */
   class Storage {
     static saveComponents(products) {
       localStorage.setItem('components', JSON.stringify(products));
     }

     static getComponent(id) {
       let components = JSON.parse(localStorage.getItem('components'));
       return components.find(component => component.id === id);
     }
   }


  /**
   * Si le tabelau components est présent dans le local Storage on appel la displayComponents() au bout d'une seconde
   */
   setTimeout(function () {
     if (localStorage.getItem('components')) {
       displayComponents()
     }
   }, 1000)


   /**
    * utilisation de la méthode forEach() afin chaque d'insérer chaque composant html dans le DOM
    */

   function displayComponents() {
     var result = '';
     arrayObjects = JSON.parse(localStorage.getItem('components'));

     arrayObjects.forEach(obj => {
       result += `
          <div class="container__component" id="${obj.id}">
            <div class="di-clipboard" id="di-clipboard">
              <small>HTML</small>
              <button type="button" data-id="${obj.id}" class="btn-clipboard">
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="stroked" viewBox="0 0 24 24" width="32" height="32" stroke-miterlimit="1.5" fill="none"><path d="m4.657 10.236 6.138 6.341 9.54-9.885" stroke="#212529" stroke-width="1"></path></svg>
              </button>
            </div>
            ${obj.html}
          </div>
          `
     })

     componentsDOM.insertAdjacentHTML('beforeend', result);

     var clipboard = Array.prototype.slice.call(document.querySelectorAll('#di-clipboard'));
     clipboard.forEach(elt => {
       elt.addEventListener('click', function (e) {
         e.preventDefault();
         var currentTarget = e.currentTarget;
         var idLibelle = currentTarget.querySelector('[data-id]').getAttribute('data-id');

         valid = Storage.getComponent(idLibelle)

         if (valid) {
           navigator.clipboard.writeText(valid.html)
           console.log(valid.html);

         } else {
           console.log('naaaaaaah');
         }
       })
     })
   }

   var urlJson = "/static/Resources/js/clipboard-showreel/dataEC.json?" + new Date().getTime();
   getComponents(urlJson)

   /**
    * La fonction fait une rêquete pour chaque object afin quel retourne le HTML de l'élément de contenu 
    * On insère une nouvelle propriété (html) a l'object
    * La propriété html va contenir le html qui a été obtenu
    * Chaque object est en parametre de la fonction saveComponents(object)
    */
   function searchHtmlGenerique(itemId, item, tab) {

     var url = "https://particuliers.pprd.sg.fr/extrestcontent/component/" + itemId

     var xhttp = new XMLHttpRequest();
     xhttp.responseType = 'text';
     xhttp.onreadystatechange = function () {
       if (this.readyState == 4) {
         res = this.responseText;
         item.html = `${res}`
         Storage.saveComponents(tab);
       }
     }

     xhttp.open('GET', url, true);
     xhttp.send();

   }

   /**
    * utilisation de la méthode fetch() afin d'acceder aux données du json(dataEC.json)
    * utilisation de la méthode forEach() afin déclencher la fonction searchHtmlGenerique pour chaque élément du tableau(arrayComponents)
    */
   async function getComponents(url) {
     lastUrl = url;

     try {

       await fetch(url)
         .then(data => data.json())
         .then(data => {
           if (data) {

             arrayComponents = data.Components;
             arrayComponents.forEach((element, index, arr) => {
               searchHtmlGenerique(element.id, element, arr)
             });
           }
         })
     } catch (error) {
       console.error(error)
     }
   }
 })