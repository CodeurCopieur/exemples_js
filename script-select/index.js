(function () {

        document.addEventListener('DOMContentLoaded', function () {

          const tabPrices = [{
              "price1": "3,00",
              "price2": "5,76",
              "price3": "7,20",
            },
            {
              "price1": "3,00",
              "price2": "6,32",
              "price3": "7,90",
            },
            {
              "price1": "13,00",
              "price2": "14,90",
              "price3": "14,90",
            }
          ];

          function dataPragraph(elts, i) {
            nodesP = Array.from(elts.querySelectorAll('option'));

            if (tabPrices[i]) {

              nodesP.map(function (elt, index) {

                if (index === 0) {
                  elt.dataset.price = tabPrices[i]["price1"];
                  elt.dataset.age = '18-24';

                } else if (index === 1) {
                  elt.dataset.price = tabPrices[i]["price2"];
                  elt.dataset.age = '25-29';

                } else {
                  elt.dataset.price = tabPrices[i]["price3"];
                  elt.dataset.age = '30-et-plus';

                }

              })
            }
          }
          function linkDefault(btn,indice , minAge, maxAge) {
            btn.href = 'https://ouvrir-un-compte-en-ligne.societegenerale.fr/EERAD/s/?productId=10' + indice + '&cataId=Std&ageId=' + minAge + '-' + maxAge+'&codeBanque=fil_rouge';
          }

          function linkDynamic(target) {
            var indice = target.dataset.indice;
            var maxAge = target.options[target.selectedIndex].dataset.dsg_max_age;
            var minAge = target.options[target.selectedIndex].dataset.dsg_min_age;
            target.parentNode.parentNode.nextElementSibling.href = 'https://ouvrir-un-compte-en-ligne.societegenerale.fr/EERAD/s/?productId=10' + indice + '&cataId=Std&ageId=' + minAge + '-' + maxAge+'&codeBanque=fil_rouge';
          }

          var lesBtns = Array.prototype.slice.call(document.querySelectorAll('.dsg_a_button.-dsg_block'));
          
          var lesSelects = Array.prototype.slice.call((document.querySelectorAll('select')));



          lesBtns.forEach(function (btn, i) {
            btn.addEventListener('click', function (e) {
              var parentElt = e.target.parentElement;

              var offre = parentElt.querySelector('select').dataset.offres;
              var slt = parentElt.querySelector('select');
              var age = slt.options[slt.selectedIndex].dataset.age;
              var maxAge = slt.options[slt.selectedIndex].dataset.dsg_max_age;
              var minAge = slt.options[slt.selectedIndex].dataset.dsg_min_age;
              var indice = i + 1;
              bddfTms.trackEvent(this, 'click', {
                event_name: 'offres-sobrio::clic-sur-souscrire-' + offre,
                page_field_1: age
              });
            })
          })


          lesSelects.map(function (elt, i) {

            switch (i) {
              case 0:
                dataPragraph(lesSelects[i], i);
                lesSelects[i].dataset.offres = 'cb-visa-evolution';
                linkDefault(lesBtns[i], i+1, lesSelects[i].options[elt.selectedIndex].dataset.dsg_min_age, lesSelects[i].options[elt.selectedIndex].dataset.dsg_max_age);
                break;

              case 1:
                dataPragraph(lesSelects[i], i);
                lesSelects[i].dataset.offres = 'cb-visa-classic';
                linkDefault(lesBtns[i], i+1, lesSelects[i].options[elt.selectedIndex].dataset.dsg_min_age, lesSelects[i].options[elt.selectedIndex].dataset.dsg_max_age);
                break;

              case 2:
                dataPragraph(lesSelects[i], i);
                lesSelects[i].dataset.offres = 'cb-visa-premier';
                linkDefault(lesBtns[i], i+1, lesSelects[i].options[elt.selectedIndex].dataset.dsg_min_age, lesSelects[i].options[elt.selectedIndex].dataset.dsg_max_age);
                break;

              default:
                break;
            }

          });

          function getElt(e) {
            var target = e.target;
            function showPrice(element) {

              var price = element.options[element.selectedIndex].dataset.price;
              element.parentNode.nextElementSibling.querySelector('span').textContent = price;

              linkDynamic(element)
            }
            
            var itemArray = lesSelects;
            var array = itemArray.filter(function (item) {
              return item !== target
            });

            for (const key in array) {
              array[key].value = target.value;

              showPrice(array[key])
            }
            linkDynamic(target)
          }

          for (let index = 0; index < lesSelects.length; index++) {
            var indice = index + 1;
            const element = lesSelects[index];
            element.addEventListener('change', getElt);
            element.setAttribute('data-indice', indice);
          }

        }, false);

      })();