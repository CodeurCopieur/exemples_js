const allBtn = Array.prototype.slice.call(document.querySelectorAll('.js-revive-btn'));
var arrayHTML = "";

function createDivWithClass(className) {
  let div = document.createElement('div');
  div.className = className;

  return div;
}
function searchHtmlGenerique(itemId, item) {
  var url = "https://particuliers.pprd.sg.fr/extrestcontent/component/" + itemId;

  var xhttp = new XMLHttpRequest();
     xhttp.responseType = 'text';
     xhttp.onreadystatechange = function () {
       if (this.readyState == 4) {
         res = this.responseText;

         var containerDiv = createDivWithClass('d-n');
       
         item.insertAdjacentElement('beforebegin', containerDiv);
         containerDiv.innerHTML = res;
         containerDiv.style.display = 'none';

         var contentHTML = containerDiv.firstChild.innerHTML
         if (res) {

          arrayHTML+=contentHTML
          // arrayHTML.join('')
          // const output = arrayHTML.toString()

          navigator.clipboard.writeText(arrayHTML)
          console.log(arrayHTML);
          // try {
            
          //   const arrayIncludesInObj = (arr, key, valueToCheck) => {
          //     return arr.some(value => value[key] === valueToCheck);
          //   }
  
          //   const found = arrayIncludesInObj(arrayHTML, "id", itemId);
            
          //   console.log(arrayHTML, found, itemId, typeof itemId);
          // } catch (error) {
          //   console.log(error);
          // }
          // navigator.clipboard.writeText(contentHTML)

          // if(arrayHTML.length === 0) {
          //   arrayHTML.push({id: itemId, html: contentHTML})
          // } else {
          //   arrayHTML.forEach( obj => {
          //     if (obj.id != itemId && arrayHTML.length > 1) {
          //       arrayHTML.push({id: itemId, html: contentHTML})
          //     } else {
          //       return;
          //     }
          //   })
          // }
         
          
          //   arrayHTML.filter( v => {
          //   if (!v.id.includes(itemId)) {
          //     arrayHTML2.push({id: itemId, contentHTML})
          //     console.log(v,!v.id.includes(itemId));
          //   } else {
          //     const found = arrayHTML.find(elt => elt.id === itemId)
          //     const isLargeNumber = (element) => element === found;
          //     arrayHTML.splice(arrayHTML.findIndex(isLargeNumber), 1)
          //   }
          // })
          // arrayHTML.forEach( function(v) {
          //   if(!arrayHTML2.includes(v.id)) {
          //     arrayHTML2.push(v)
          //     console.log('arrayHTML2', arrayHTML2);
          //   } else {
          //     const found = arrayHTML.find(elt => elt.id === itemId)
          //       const isLargeNumber = (element) => element === found;
          //       arrayHTML.splice(arrayHTML.findIndex(isLargeNumber), 1)
          //   }
          // })


          // if(arrayHTML.some(r=> !r.itemId.includes(itemId))) {
          //   arrayHTML.push({id: itemId, html: contentHTML})
          // } else {
          //   const found = arrayHTML.find(elt => elt.html === contentHTML)
          //   const isLargeNumber = (element) => element === found;
          //   arrayHTML.splice(arrayHTML.findIndex(isLargeNumber), 1)
          // }

          // const found = arrayHTML.some(r=> itemId.includes(r.itemId))

          // if (found) {
          //   console.log('oui');
          // }

          //ACTIVE BTN
          allBtn.forEach( n => n.classList.remove('active'));
          item.classList.add('active')
          setTimeout(function () {
            containerDiv.remove()
          }, 1000)
         }
       }
     }

     xhttp.open('GET', url, true);
     xhttp.send();
}

function controlExpanded(item, attr) {
  if (item.classList.contains('active')) {
    var isExpanded = attr.getAttribute('data-expanded') === 'true';

    if (attr.getAttribute('data-expanded') === 'false') {
      attr.setAttribute('data-expanded', 'true');
    }  
    
    if(attr.getAttribute('data-expanded') === 'true') {
      attr.setAttribute('data-expanded', 'false');
    }
  }
}

allBtn.forEach( (btn) => {
  btn.dataset.expanded = false;
  btn.addEventListener('click', (e)=> {
    e.preventDefault();
    var currentTarget = e.currentTarget;
    var dataCodeCible = currentTarget.getAttribute('data-code-cible');
    // currentTarget.dataset.expanded = true;
    // var expanded = currentTarget.getAttribute('data-expanded');
    // if (expanded === true) {
    //   currentTarget.dataset.expanded = false;
    // } else {
    //   currentTarget.dataset.expanded = true;
    // }
    
    searchHtmlGenerique(dataCodeCible, currentTarget)
    
    
  })
})
