//Object- use function constuctor
function Validator(option) {
  var formElement = document.querySelector(option.form);
  var selectorRules = {};

  function validate(inputElement, rule) {
    var errElement = inputElement
      .closest(option.formGroupSelector)
      .querySelector(option.errSelector);
    var errMessage;
    //Get all rules of selector
    var rules = selectorRules[rule.seletor];
    //Loop each rules and check
    for (let i in rules) {
      switch (inputElement.type) {
        case "checkbox":
        case "radio":
          errMessage = rules[i](
            formElement.querySelector(rule.seletor + ":checked")
          );
          break;
        default:
          errMessage = rules[i](inputElement.value);
          break;
      }

      //If 1 rule has err, break (check err sequence)
      if (errMessage) break;
    }

    if (errMessage) {
      errElement.innerText = errMessage;
      inputElement.closest(option.formGroupSelector).classList.add("invalid");
    } else {
      errElement.innerText = "";
      inputElement
        .closest(option.formGroupSelector)
        .classList.remove("invalid");
    }

    return !errMessage;
  }

  if (formElement) {
    //Listen submit event of form
    formElement.onsubmit = function (e) {
      e.preventDefault();

      var isFormValid = true;

      option.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.seletor);
        var isVAlid = validate(inputElement, rule);
        if (!isVAlid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        if (typeof option.onSubmit === "function") {
          //get all element into form has attribute name and not has attribute disable
          const enableInputs = formElement.querySelectorAll(
            "[name]:not([disabled])"
          );
          const formValues = Array.from(enableInputs).reduce(
            (values, input) => {
              switch (input.type) {
                case "radio":
                  if (input.matches(":checked"))
                    values[input.name] = input.value;
                  break;
                case "checkbox":
                  if (!input.matches(":checked")) {
                    return values;
                  }
                  if (!Array.isArray(values[input.name])) {
                    values[input.name] = [];
                  }

                  values[input.name].push(input.value);

                  break;
                case "file":
                  values[input.name] = Array.from(input.files);
                  break;
                default:
                  values[input.name] = input.value;
                  break;
              }
              return values;
            },
            {}
          );
          option.onSubmit(formValues);
        }
      }
    };

    //Loop each rule and listen event
    option.rules.forEach(function (rule) {
      //Save rule selector
      if (Array.isArray(selectorRules[rule.seletor])) {
        selectorRules[rule.seletor].push(rule.test);
      } else {
        selectorRules[rule.seletor] = [rule.test];
      }

      var inputElements = formElement.querySelectorAll(rule.seletor);
      Array.from(inputElements).forEach((inputElement) => {
        if (inputElement) {
          //Listen blur event
          inputElement.onblur = function () {
            validate(inputElement, rule);
          };

          //Listen when user enter on input
          inputElement.oninput = function () {
            var errElement = inputElement
              .closest(option.formGroupSelector)
              .querySelector(".form-message");
            errElement.innerText = "";
            inputElement
              .closest(option.formGroupSelector)
              .classList.remove("invalid");
          };
        }
      });
    });
  }
}

Validator.isRequired = function (seletor, msg) {
  return {
    seletor,
    test: function (value) {
      return value ? undefined : msg || "Vui lòng nhập trường này";
    },
  };
};

Validator.isEmail = function (seletor, msg) {
  return {
    seletor,
    test: function (value) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(value)
        ? undefined
        : msg || "Vui lòng nhập email hợp lệ";
    },
  };
};

Validator.minLength = function (seletor, min, msg) {
  return {
    seletor,
    test: function (value) {
      return value.length >= min
        ? undefined
        : msg || "Vui lòng nhập tối thiểu 6 ký tự";
    },
  };
};

Validator.isConfirm = function (seletor, getConfirmVal, msg) {
  return {
    seletor,
    test: function (value) {
      return value === getConfirmVal()
        ? undefined
        : msg || "Gía trị nhập vào không chính xác";
    },
  };
};
