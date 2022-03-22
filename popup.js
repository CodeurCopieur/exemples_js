console.clear();

$(document).ready(function(){

  var module = (function(){
    
    var base = 100;
    var mapObj = {};
    
    $('.input').closest('.wrap').each(function(i, el){
      mapObj[el.dataset.selection] = 0;

      console.log(mapObj[el.dataset.selection] );
     });
    
    function mapping(obj){
      
     for(let key in obj){
       if(mapObj.hasOwnProperty(key)){
         mapObj[key] = obj[key];
         console.log(mapObj);
       }
     }
     
      let r = Object.assign({}, mapObj, obj);

      console.log(r);
      
      setTotal(r)
    }
    
    function setTotal(obj){
      let total = Object.values(obj).reduce(function(acc, curr){
        return acc + curr
      }, 0) + base;
      
      console.log(total)
      $('#amount').html(total)
    }
    
    function handleCheckboxWithQuantity(obj){
      console.log('ici')
    }
    
    function handleCheckboxNoQuantity(obj){
      let selection = $(obj).closest('.wrap')[0].dataset.selection;
      let value = Number($(obj).closest('.wrap')[0].dataset.value);
      
      if(obj.prop('checked')){
        mapping({[selection] : value})
      }else{
        mapping({[selection] : 0})
      }
    }
    
    function handleCheckboxWithQuantityMultiplier(obj){
      let value = Number($(obj)[0].target.value) * Number($(this).closest('.wrap').data('value'));     
      let selection = $(this).closest('.wrap').data('selection');
      
       mapping({[selection] : value})
      
    }
    
   
    function increaseQuantityMultiplier(){
      var oldValue = Number($(this).closest('.wrap').find('.quantity')[0].value);
      $(this).closest('.wrap').find('.quantity')[0].value = oldValue === 10 ? 10 : oldValue + 1;
      var currentValue = Number($(this).closest('.wrap').find('.quantity')[0].value);
      var operation = oldValue < currentValue ? 'add' : 'substract';
      
      var selection = $(this).closest('.wrap').data('selection') ;
      var total = Number($(this).closest('.wrap').data('value')) * Number($(this).closest('.wrap').find('.quantity')[0].value);
      
      mapping({[selection] : total})

    }
    
    function decreaseQuantityMultiplier(){
      var oldValue = Number($(this).closest('.wrap').find('.quantity')[0].value);
      $(this).closest('.wrap').find('.quantity')[0].value = oldValue === 0 ? 0 : oldValue - 1;
      var currentValue = Number($(this).closest('.wrap').find('.quantity')[0].value);
      var operation = oldValue < currentValue ? 'add' : 'substract';
      
      var selection = $(this).closest('.wrap').data('selection') ;
      var total = Number($(this).closest('.wrap').data('value')) * Number($(this).closest('.wrap').find('.quantity')[0].value);
      
      mapping({[selection] : total})
    }
    
    function handleCheckbox(){
      let selectedType = $(this).parent('.wrap').data('type');
      if(selectedType === 'checkboxNoQuantity'){
        handleCheckboxNoQuantity($(this))
      }else{
        handleCheckboxWithQuantity($(this))
      }
    }
    
    return {
      handleCheckboxNoQuantity: handleCheckboxNoQuantity,
      handleCheckboxWithQuantity: handleCheckboxWithQuantity,
      handleCheckboxWithQuantityMultiplier: handleCheckboxWithQuantityMultiplier,
      increaseQuantityMultiplier: increaseQuantityMultiplier,
      decreaseQuantityMultiplier: decreaseQuantityMultiplier,
      handleCheckbox: handleCheckbox
    }
    
  })();
  
  $('.input').on('change', module.handleCheckbox);
  $('.quantity').on('change', module.handleCheckboxWithQuantityMultiplier);
  $('.increase').on('click', module.increaseQuantityMultiplier);
  $('.decrease').on('click', module.decreaseQuantityMultiplier);
  
  
  
});