//function to get prams from url

function GetURLParameter(sParam) {
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++)
  {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam)
    {
      return sParameterName[1];
    }
  }
};

$(document).ready(function(){
  
  var show_error, stripeResponseHandler, submitHandler;


//function to handle the submission of the form and intercepth the default event
  submitHandler = function (event) {
    var $form = $(event.target);
    $form.find("input[type=submit]").prop("disabled", true);
    if(Stripe){
      Stripe.card.createToken($form, stripeResponseHandler);
    } else {
      show_error("Failed to load credit card processing functionality. Please reload the page.");
    }
    return false;
  };
//initiate submit handler listener for any form with class 'cc_form'
  $(".cc_form").on("submit", submitHandler);
//handle the event of plan dropdown changing
  var handlePlanChange = function(plan_type, form) {
    var $form = $(form);
    
    if (plan_type == undefined) {
      plan_type = $('#tenant_plan :selected').val();
    }
    
    if (plan_type == 'premium') {
      $('[data-stripe]').prop('required', true);
      $form.off('submit');
      $form.on('submit', submitHandler);
      $('[data-stripe]').show();
    } else {
      $('[data-stripe}').hide();
      $form.off('submit');
      $('[data-stripe]').removeProp('required');
    }
  };
//set up plan change event listener #tenant_plan in the forms for class cc_form

  $('#tenant_plan').on('change', function(event){
    handlePlanChange($('#tenant_plan :selected').val(), '.cc_form');
  });

//call plan change handler so the plan is set corretly in the dropdown when page loads

  handlePlanChange(GetURLParameter('plan'), ".cc_form");

//function to handle the token recieved from stripe and remove cc fields

  stripeResponseHandler = function (status, response) {
    var token, $form;
    
    $form = $(".cc_form");
    
    if (response.error) {
      console.log(response.error.message);
      show_error(response.error.message);
      $form.find("input[type=submit]").prop("disabled", false);
    } else {
      token = response.id;
      $form.append($("<input type=\"hidden\" name=\"payment[token]\" />").val(token));
      // remove cc info so it doesnt hit Data Base
      $("[data-stripe=number]").remove();
      $("[data-stripe=cvv]").remove();
      $("[data-stripe=year]").remove();
      $("[data-stripe=month]").remove();
      $("[data-stripe=label]").remove();
      $form.get(0).submit();
    }
    // stop default event from happening
    return false;
  };

  //function to show errors when stripe functionality returns an errror
  show_error = function (message) {
    if($("#flash-messages").size() < 1){
      $("div.container.main div:first").prepend("<div id='flash-messages'></div>")
    }
    $("#flash-messages").html('<div class="alert alert-warning"><a class="close" data-dismiss="alert">x</a><div id="flash-alert">'+ message + '</div></div>');
    $('.alert').delay(5000).fadeOut(3000);
    return false;
  };
});