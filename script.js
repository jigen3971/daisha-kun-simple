const GAS_URL = "https://script.google.com/macros/s/AKfycbx1_EpLviIW221CXfOiEJnlllkPWC407sJbDemxxiBosiFbmFR4agret5_krrJ_4MRu/exec";

const DEFAULT_CARS = [
  "代車1　ワゴンR　郡山〇〇 あ12-34",
  "代車2　ムーヴ　郡山〇〇 い56-78",
  "代車3　アルト　郡山〇〇 う90-12",
  "代車4　ミライース　郡山〇〇 え34-56",
  "代車5　タント　郡山〇〇 お78-90",
  "代車6　N-BOX　郡山〇〇 か11-22",
  "代車7　スペーシア　郡山〇〇 き33-44",
  "代車8　ハイゼット　郡山〇〇 く55-66",
  "代車9　エブリイ　郡山〇〇 け77-88",
  "代車10　アクア　郡山〇〇 こ99-00",
  "代車11　フィット　郡山〇〇 さ12-34",
  "代車12　ノート　郡山〇〇 し56-78",
  "代車13　軽トラック　郡山〇〇 す90-12",
  "代車14　軽バン　郡山〇〇 せ34-56",
  "代車15　その他　郡山〇〇 そ78-90"
];

const STORAGE_KEY = "daishaKunCars";

const CHECK_ITEMS = [
  ["自動車保険の確認", "当社の代車には任意保険が付保されていない場合があります。事故時は乙の保険で対応するものとし、無保険の場合は貸出できません。"],
  ["交通違反について", "駐車違反等を含む交通違反は乙の責任で処理し、反則金の支払いおよび警察対応を行うものとします。"],
  ["使用者の限定", "代車の使用は本人のみとし、第三者への貸与（又貸し）は一切禁止します。"],
  ["事故・損害の責任", "事故・故障・損傷について甲は一切責任を負いません。"],
  ["鍵の紛失", "鍵紛失時は鍵作成・交換費用として金100,000円を請求します。"],
  ["燃料", "燃料は満タン返却とします。"],
  ["禁煙・電子タバコ禁止", "全車禁煙とし、電子タバコを含め一切の喫煙を禁止します。"],
  ["ペット・臭気物禁止", "ペット同乗および強い臭気物の持込みは禁止とします。"],
  ["日常点検義務", "オイル・冷却水等の点検不足による故障は乙の負担とします。"],
  ["用途制限", "違法行為・過積載・改造等は禁止とします。"],
  ["返却義務", "指定日時までに返却するものとします。"],
  ["損傷・汚損", "返却時の新たな傷・汚れは修理費を請求します。"]
];

const rentalSelect = document.getElementById("rentalCar");
const returnSelect = document.getElementById("returnCar");
const rentBtn = document.querySelector(".rent-btn");
const returnBtn = document.querySelector(".return-btn");
const newCarInput = document.getElementById("newCar");
const addCarBtn = document.getElementById("addCarBtn");
const carList = document.getElementById("carList");

let isRenting = false;
let isReturning = false;
let cars = loadCars();
let latestRentedCars = [];

function loadCars() {
  const savedCars = localStorage.getItem(STORAGE_KEY);

  if (!savedCars) {
    return [...DEFAULT_CARS];
  }

  try {
    const parsedCars = JSON.parse(savedCars);
    return Array.isArray(parsedCars) && parsedCars.length > 0 ? parsedCars : [...DEFAULT_CARS];
  } catch (error) {
    console.error(error);
    return [...DEFAULT_CARS];
  }
}

function saveCars() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
}

function addCarOptions(select, cars) {
  const firstOption = select.options[0];
  select.replaceChildren(firstOption);

  cars.forEach((car) => {
    const option = document.createElement("option");
    option.value = car;
    option.textContent = car;
    select.appendChild(option);
  });
}

function renderCarList() {
  carList.innerHTML = "";

  if (cars.length === 0) {
    carList.innerHTML = '<p class="empty-text">登録されている代車がありません。</p>';
    return;
  }

  cars.forEach((car, index) => {
    const row = document.createElement("div");
    row.className = "car-row";

    const name = document.createElement("span");
    name.textContent = car;

    const button = document.createElement("button");
    button.className = "delete-car-btn";
    button.type = "button";
    button.textContent = "削除";
    button.addEventListener("click", () => {
      if (!confirm(`${car} を削除しますか？`)) return;
      cars.splice(index, 1);
      saveCars();
      refreshCarSelects(latestRentedCars);
    });

    row.append(name, button);
    carList.appendChild(row);
  });
}

function refreshCarSelects(rentalCars = []) {
  const rentedSet = new Set(rentalCars);

  addCarOptions(rentalSelect, cars);
  addCarOptions(returnSelect, cars.filter((car) => rentedSet.has(car)));

  Array.from(rentalSelect.options).forEach((option) => {
    if (rentedSet.has(option.value)) {
      option.disabled = true;
      option.textContent = `貸出中：${option.value}`;
    }
  });

  returnSelect.options[0].textContent = returnSelect.options.length === 1
    ? "貸出中の代車はありません"
    : "返却する代車を選択";

  renderCarList();
}

function handleAddCar() {
  const newCar = newCarInput.value.trim();

  if (!newCar) {
    alert("追加する代車を入力してください");
    newCarInput.focus();
    return;
  }

  if (cars.includes(newCar)) {
    alert("同じ代車がすでに登録されています");
    newCarInput.focus();
    return;
  }

  cars.push(newCar);
  saveCars();
  newCarInput.value = "";
  refreshCarSelects(latestRentedCars);
}

function renderCheckItems() {
  const checkList = document.getElementById("checkList");

  CHECK_ITEMS.forEach(([title, body], index) => {
    const number = index + 1;
    const check = document.createElement("div");
    check.className = "check";

    check.innerHTML = `
      <input id="check${number}" type="checkbox">
      <label for="check${number}">【${number}】${title}<br>${body}</label>
    `;

    checkList.appendChild(check);
  });
}

function showLoading(button, text) {
  button.disabled = true;
  button.textContent = text;
}

function resetButton(button, text) {
  button.disabled = false;
  button.textContent = text;
}

function validateRequiredItems() {
  const requiredItems = document.querySelectorAll("[required]");

  for (const item of requiredItems) {
    if (!item.value.trim()) {
      alert("必須項目をすべて入力してください");
      item.focus();
      return false;
    }
  }

  return true;
}

function validateTel() {
  const telInput = document.getElementById("customerTel");
  const tel = telInput.value.trim();

  if (!/^\d{11}$/.test(tel)) {
    alert("電話番号はハイフンなし11桁で入力してください");
    telInput.focus();
    return false;
  }

  return true;
}

function validateChecks() {
  const checks = document.querySelectorAll(".check input[type='checkbox']");

  for (const check of checks) {
    if (!check.checked) {
      alert("確認事項すべてにチェックしてください");
      check.focus();
      return false;
    }
  }

  return true;
}

async function postData(data) {
  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
}

async function handleRent() {
  if (isRenting) return;
  isRenting = true;

  if (!validateRequiredItems() || !validateTel() || !validateChecks()) {
    isRenting = false;
    return;
  }

  showLoading(rentBtn, "登録中...");

  const data = {
    mode: "rent",
    car: rentalSelect.value,
    name: document.getElementById("customerName").value.trim(),
    tel: document.getElementById("customerTel").value.trim(),
    reason: document.getElementById("reason").value,
    start: document.getElementById("startDate").value,
    end: document.getElementById("endDate").value,
    staff: document.getElementById("staff").value,
    sign: document.getElementById("signature").value.trim()
  };

  try {
    await postData(data);
    alert("貸出確認を登録しました");
    location.reload();
  } catch (error) {
    console.error(error);
    alert("送信エラーが出ました。通信環境またはGoogle Apps Scriptを確認してください。");
    isRenting = false;
    resetButton(rentBtn, "貸出確認完了");
  }
}

async function handleReturn() {
  if (isReturning) return;
  isReturning = true;

  if (!returnSelect.value) {
    alert("返却する代車を選択してください");
    returnSelect.focus();
    isReturning = false;
    return;
  }

  showLoading(returnBtn, "返却中...");

  try {
    await postData({
      mode: "return",
      car: returnSelect.value
    });

    alert("返却済みにしました");
    location.reload();
  } catch (error) {
    console.error(error);
    alert("返却処理でエラーが出ました。通信環境またはGoogle Apps Scriptを確認してください。");
    isReturning = false;
    resetButton(returnBtn, "返却完了");
  }
}

async function loadRentalCars() {
  try {
    const res = await fetch(GAS_URL);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const rentalCars = await res.json();
    latestRentedCars = rentalCars;
    refreshCarSelects(latestRentedCars);
  } catch (error) {
    console.error(error);
    refreshCarSelects();
    alert("貸出中データを取得できませんでした。代車一覧のみ表示します。");
  }
}

renderCheckItems();
refreshCarSelects();
loadRentalCars();
addCarBtn.addEventListener("click", handleAddCar);
newCarInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleAddCar();
  }
});
rentBtn.addEventListener("click", handleRent);
returnBtn.addEventListener("click", handleReturn);
