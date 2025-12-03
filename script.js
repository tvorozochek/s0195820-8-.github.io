const openBtn = document.querySelector('.but');
const popup = document.querySelector('.form-back');
const form = document.querySelector('.form');

const fio = document.querySelector('#fio');
const mail = document.querySelector('#mail');
const phone = document.querySelector('#phone');
const org = document.querySelector('#org');
const mes = document.querySelector('#mes');
const chek = document.querySelector('#chek');

function openPopup(push = true) {
    popup.classList.remove('hidden');
    if (push) history.pushState({form: true}, '', '?form=open');
}

function closePopup() {
    popup.classList.add('hidden');
}

openBtn.addEventListener('click', () => openPopup());

window.addEventListener('popstate', () => {
    closePopup();
});

if (window.location.search.includes('form=open')) {
    openPopup(false);
}

function validateFio(value) {
    return /^[А-Яа-яЁёA-Za-z\s\-]{5,}$/.test(value);
}

function validateEmail(value) {
    return /^[\w.-]+@[\w.-]+\.\w+$/.test(value);
}

function validatePhone(value) {
    return /^[0-9+\-\s()]{7,}$/.test(value);
}

function showError(message) {
    alert("Ошибка: " + message);
}

function showSuccess(message) {
    alert(message);
}

function saveToLocalStorage() {
    const data = {
        fio: fio.value,
        mail: mail.value,
        phone: phone.value,
        org: org.value,
        mes: mes.value,
        chek: chek.checked
    };
    localStorage.setItem('formData', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('formData');
    if (!saved) return;

    try {
        const data = JSON.parse(saved);
        fio.value = data.fio || "";
        mail.value = data.mail || "";
        phone.value = data.phone || "";
        org.value = data.org || "";
        mes.value = data.mes || "";
        chek.checked = data.chek || false;
    } catch {}
}

loadFromLocalStorage();

form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', saveToLocalStorage);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateFio(fio.value)) return showError("Введите корректное ФИО (минимум 5 букв)");
  if (!validateEmail(mail.value)) return showError("Неверный формат email");
  if (!validatePhone(phone.value)) return showError("Неверный формат телефона");
  if (!chek.checked) return showError("Необходимо согласие на обработку данных");

  const url = "https://formcarry.com/s/5jdOvDX1W2b";

  // 1) Попробуем отправить FormData с Accept: application/json
  try {
    const fd = new FormData(form);

    let response = await fetch(url, {
      method: "POST",
      body: fd,
      headers: {
        "Accept": "application/json"
      }
    });

    // Если сервер вернул 406, попробуем второй подход (JSON)
    if (response.status === 406) {
      // Попытка 2 — отправляем JSON
      const payload = {
        fio: fio.value,
        mail: mail.value,
        phone: phone.value,
        org: org.value,
        mes: mes.value,
        chek: chek.checked
      };

      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) {
      // Попробуем прочитать тело ответа — иногда там подсказка
      let txt;
      try { txt = await response.text(); } catch (_) { txt = ''; }
      throw new Error("Сервер вернул " + response.status + " — " + txt);
    }

    showSuccess("Сообщение отправлено!");
    form.reset();
    localStorage.removeItem('formData');

  } catch (err) {
    console.error("Ошибка отправки:", err);
    showError("Не удалось отправить данные. Открой консоль для деталей.");
  }
});
