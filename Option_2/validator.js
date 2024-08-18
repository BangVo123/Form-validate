function Validator(formSelector) {
  const formRules = {};
  /**
   * invalid validation: return error mesage
   * Valid: return undefined
   */
  const validatorRules = {
    required: function (value) {
      return value ? undefined : "Vui lòng nhập trường này";
    },
    email: function (value) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(value) ? undefined : "Vui lòng nhập email";
    },
    min: function (min) {
      return function (value) {
        return value.length >= min
          ? undefined
          : `Vui lòng nhập ít nhất ${min} ký tự`;
      };
    },
    max: function (max) {
      return function (value) {
        return value.length < max
          ? undefined
          : `Vui lòng nhập nhiều nhất ${max} ký tự`;
      };
    },
  };

  //Get form
  const formElement = document.querySelector(formSelector);

  //Check has element, if true, will be check selector
  if (formElement) {
    const inputs = formElement.querySelectorAll("[name][rules]");
    for (const input of inputs) {
      const rules = input.getAttribute("rules").split("|");
      for (let rule of rules) {
        var ruleInfo;
        var isRuleHasVal = rule.includes(":");

        if (rule.includes(":")) {
          ruleInfo = rule.split(":");
          rule = ruleInfo[0];
        }

        var ruleFunc = validatorRules[rule];
        if (isRuleHasVal) {
          ruleFunc = validatorRules[rule](ruleInfo[1]);
        }

        if (Array.isArray(formRules[input.name])) {
          formRules[input.name].push(ruleFunc);
        } else {
          formRules[input.name] = [ruleFunc];
        }

        //Listen event on input
        input.onblur = handleValidate;
        input.oninput = handleClearErr;
      }

      function handleValidate(event) {
        var rules = formRules[event.target.name];
        var errMsg;

        for (let rule of rules) {
          errMsg = rule(event.target.value);
          if (errMsg) break;
        }
        //If has error, show error message on UI
        if (errMsg) {
          //event.target: current element(input), closest: find parent element match param
          const formGroup = event.target.closest(".form-group");
          if (formGroup) {
            formGroup.classList.add("invalid");
            const formMsg = formGroup.querySelector(".form-message");
            formMsg.innerText = errMsg;
          }
        }

        return !errMsg;
      }

      function handleClearErr(event) {
        const formGroup = event.target.closest(".form-group");
        if (formGroup.classList.contains("invalid")) {
          formGroup.classList.remove("invalid");

          const formMsg = formGroup.querySelector(".form-message");
          formMsg.innerText = "";
        }
      }
    }
  }

  formElement.onsubmit = (e) => {
    e.preventDefault();

    const inputs = formElement.querySelectorAll("[name][rules]");
    let isValid = true;
    for (let input of inputs) {
      if (!handleValidate({ target: input })) {
        isValid = false;
      }
    }

    //If not error, submit form
    if (isValid) {
      if (typeof this.onSubmit === "function") {
        const enableInputs = formElement.querySelectorAll(
          "[name]:not([disabled])"
        );
        const formValues = Array.from(enableInputs).reduce((values, input) => {
          switch (input.type) {
            case "radio":
              if (input.matches(":checked")) values[input.name] = input.value;
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
        }, {});
        this.onSubmit(formValues);
      } else {
        formElement.submit();
      }
    }
  };
}
