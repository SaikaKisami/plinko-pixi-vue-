<template>
  <div :class="'container'">
    <div :class="'spanstyle'">Bet Amount: {{ amount }}</div>
    <input
      :class="['baseStyle', { warning: isEmpty }]"
      v-model="amount"
      placeholder="0.0000"
      type="number"
      min="0"
    />
    <button :class="['baseStyle', 'betButton']" @click="bet">
      {{ isManualButton ? "Bet" : isAutoBetting ? "Stop Bet" : "Auto Bet" }}
    </button>
    <div :class="'spanstyle'">Risk: {{ risk }}</div>
    <select :class="'baseStyle'" v-model="risk" @change="onRiskChange">
      <option value="Low">Low</option>
      <option value="Medium">Medium</option>
      <option value="High">High</option>
    </select>
    <div :class="'spanstyle'">Rows: {{ rows }}</div>
    <select :class="'baseStyle'" v-model="rows" @change="onRowChange">
      <option value="8">8</option>
      <option value="9">9</option>
      <option value="10">10</option>
      <option value="11">11</option>
      <option value="12">12</option>
      <option value="13">13</option>
      <option value="14">14</option>
      <option value="15">15</option>
      <option value="16">16</option>
    </select>
    <div v-if="isAutoButton">
      <div :class="'spanstyle'">Number of Bets: {{ numberofbet }}</div>
      <input
        :class="'baseStyle'"
        v-model="numberofbet"
        placeholder="0"
        type="number"
        min="0"
      />
    </div>

    <div :class="'betTypeContainer'">
      <button
        :class="['typeButton', { betTypeActive: isManualButton }]"
        id="manualButton"
        @click="activeButton('manualButton')"
      >
        Manual
      </button>
      <button
        :class="['typeButton', { betTypeActive: isAutoButton }]"
        id="autoButton"
        @click="activeButton('autoButton')"
      >
        Auto
      </button>
    </div>
  </div>
</template>

<style scoped>
.container {
  background-color: #213743;
  padding-left: 30px;
  padding-right: 30px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
}
.baseStyle {
  width: 100%;
  height: 30px;
  background-color: #0f212e;
  border-radius: 4px;
  border: 2px solid #2f4553;
  color: #fff;
  margin-bottom: 20px;
}
input,
select {
  box-sizing: border-box;
  width: 100%;
}
.spanstyle {
  color: #fff;
}

.betButton {
  background-color: #00e701;
  border-radius: 4px;
  height: 42px;
  border: none;
  color: #000000;
  font-weight: 600;
}
.betTypeContainer {
  display: flex;
  flex-direction: row;
  gap: 10px;
  border-radius: 1000px;
  background-color: #0f212e;
  padding: 2px;
  margin-bottom: 20px;
}
.typeButton {
  width: 100%;
  height: 30px;
  color: #fff;
  background-color: transparent;
  border: none;
}
.betTypeActive {
  border-radius: 1000px;
  background-color: #2f4552;
}

.warning {
  border: 2px solid #ff0000;
}
</style>

<script setup>
import { ref, onMounted } from "vue";
import { Plinko } from "./Plinko";

const isManualButton = ref(true);
const isAutoButton = ref(false);
const isAutoBetting = ref(false);
const isEmpty = ref(true);
const amount = ref("0");
const risk = ref("Low");
const rows = ref("8");
const numberofbet = ref(0);
let intervalId;
let rowNum = 8;
let basket = [2.1, 1.2, 1.0, 0.8, 0.5, 0.8, 1.0, 1.2, 2.1];
let percentage = [];

const basket_risk = ref(basket);
const plinko = Plinko(document.body.querySelector("#canvas"));
plinko.map(basket_risk.value);

const onRowChange = () => {
  rowNum = parseInt(rows.value);
  switch (rows.value) {
    case "8":
      basket = [2.1, 1.2, 1.0, 0.8, 0.5, 0.8, 1.0, 1.2, 2.1];
      percentage = changePercent([1, 8, 28, 56, 70, 56, 28, 8, 1]);
      break;
    case "9":
      basket = [2.1, 1.2, 1.0, 0.8, 0.5, 0.5, 0.8, 1.0, 1.2, 2.1];
      percentage = changePercent([1, 9, 36, 84, 126, 126, 84, 36, 9, 1]);
      break;
    case "10":
      basket = [3.6, 2.1, 1.2, 1.0, 0.8, 0.5, 0.8, 1.0, 1.2, 2.1, 3.6];
      percentage = changePercent([
        1, 10, 45, 120, 210, 252, 210, 120, 45, 10, 1,
      ]);
      break;
    case "11":
      basket = [3.6, 2.1, 1.2, 1.0, 0.8, 0.5, 0.5, 0.8, 1.0, 1.2, 2.1, 3.6];
      percentage = changePercent([
        1, 11, 55, 165, 330, 462, 462, 330, 165, 55, 11, 1,
      ]);
      break;
    case "12":
      basket = [5.6, 3.6, 2.1, 1.2, 1, 0.8, 0.5, 0.8, 1, 1.2, 2.1, 3.6, 5.6];
      percentage = changePercent([
        1, 12, 66, 220, 495, 792, 924, 792, 495, 220, 66, 12, 1,
      ]);
      break;
    case "13":
      basket = [
        5.6, 3.6, 2.1, 1.2, 1, 0.8, 0.5, 0.5, 0.8, 1, 1.2, 2.1, 3.6, 5.6,
      ];
      percentage = changePercent([
        1, 13, 78, 186, 715, 1287, 1716, 1716, 1287, 715, 186, 78, 13, 1,
      ]);
      break;
    case "14":
      basket = [
        7.2, 5.6, 3.6, 2.1, 1.2, 1, 0.8, 0.5, 0.8, 1, 1.2, 2.1, 3.6, 5.6, 7.2,
      ];
      percentage = changePercent([
        1, 14, 91, 264, 901, 2002, 3003, 3432, 3003, 2002, 901, 264, 91, 14, 1,
      ]);
      break;
    case "15":
      basket = [
        7.2, 5.6, 3.6, 2.1, 1.2, 1, 0.8, 0.5, 0.5, 0.8, 1, 1.2, 2.1, 3.6, 5.6,
        7.2,
      ];
      percentage = changePercent([
        1, 15, 105, 355, 1165, 2903, 5005, 6435, 6435, 5005, 2903, 1165, 355,
        105, 15, 1,
      ]);
      break;
    case "16":
      basket = [
        10, 7.2, 5.6, 3.6, 2.1, 1.2, 1, 0.8, 0.5, 0.8, 1, 1.2, 2.1, 3.6, 5.6,
        7.2, 10,
      ];
      percentage = changePercent([
        1, 16, 120, 460, 1520, 4068, 7908, 11440, 12870, 11440, 7908, 4068,
        1520, 460, 120, 16, 1,
      ]);
      break;
    default:
      basket = [2.1, 1.2, 1.0, 0.8, 0.5, 0.8, 1.0, 1.2, 2.1];
      percentage = changePercent([1, 8, 28, 56, 70, 56, 28, 8, 1]);
  }
  onRiskChange();
};

const onRiskChange = () => {
  plinko.clear();
  if (risk.value === "Low") {
    basket_risk.value = basket.map((item) => (item ** 1).toFixed(2));
  } else if (risk.value === "Medium") {
    basket_risk.value = basket.map((item) => (item ** 1.4).toFixed(2));
  } else if (risk.value === "High") {
    basket_risk.value = basket.map((item) => (item ** 2).toFixed(2));
  }
  plinko.map(basket_risk.value, percentage);
};

const changePercent = (values) => {
  const sum = values.reduce((acc, val) => acc + val, 0);
  percentage = values.map((val) => val / sum);
  return percentage;
};

const bet = () => {
  if (amount.value == 0 || amount.value == undefined || amount.value == "") {
    isEmpty.value = true;
    return;
  } else {
    isEmpty.value = false;
    if (isManualButton.value) {
      dropParticle();
    } else {
      if (
        parseInt(numberofbet.value) === 0 ||
        numberofbet.value === undefined ||
        numberofbet.value === ""
      ) {
        if (!isAutoBetting.value) {
          isAutoBetting.value = true;
          startInterval();
        } else {
          isAutoBetting.value = false;
          stopInterval();
        }
      } else {
        for (let i = 0; i < numberofbet.value; i++) {
          setTimeout(() => {
            dropParticle();
          }, 500 * i);
        }
      }
    }
  }
};

function startInterval() {
  intervalId = setInterval(dropParticle, 500);
}

function stopInterval() {
  clearInterval(intervalId);
}

function dropParticle() {
  let target = 0;
  let sum = 0;
  const randomNumber = Math.random();
  for (let i = 0; i < percentage.length; i++) {
    sum += percentage[i];
    if (randomNumber >= sum - percentage[i] && randomNumber < sum) {
      target = i + 1;
      break;
    } else {
      continue;
    }
  }
  plinko.add(rowNum, target);
}

const activeButton = (buttonId) => {
  isManualButton.value = buttonId === "manualButton";
  isAutoButton.value = buttonId === "autoButton";
};

onMounted(() => {
  percentage = changePercent([1, 8, 28, 56, 70, 56, 28, 8, 1]);
});
</script>
