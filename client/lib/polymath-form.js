var POLYMATH_FORM = function() {

	var submitForm = function(el, callback) {
        var errors = [];
        var data = el.serializeArray();
        var requiredFields = el.find("[required]");
        el.find(".notification").removeClass("active");
        requiredFields.each(function(i) {
            if($(this).val() == "") {
                errors.push("Please fill out all required fields.")
            }
        });
        if(errors.length > 0) {
            callback({error: true, message: errors[0]});
        } else {
            $.ajax({
                method: "POST",
                url: "/api/form/submit",
                data: data,
                success: function(msg) {
                    callback(msg);
                },
                error: function(msg) {
                    callback(msg.responseJSON);
                },
            });
        }
	};
  
	return {
		submit: submitForm,
	};
  
}();

module.exports = POLYMATH_FORM;