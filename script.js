const getItemPrice = async (itemName, city) => {
    const res = await fetch(`https://west.albion-online-data.com/api/v2/stats/prices/${itemName}.json?locations=${city}`);
    const data = await res.json();
    return data[0].sell_price_min;
};

const getUserInputs = async () => {
    const selectMaterialEl = document.querySelector('select#material');
    const optionMaterialEl = selectMaterialEl.selectedIndex;
    const selectCityEl = document.querySelector('select#city');
    const selectTierEl = document.querySelector('select#tier');
    const optionTierEl = selectTierEl.selectedIndex;
    const enchantment = getCheckedRadio('enchantment')[0];
    const returnRate = document.querySelector('input#return-rate').value;
    const errorMsgEl = document.querySelector('p#error-msg');
    const divPrices = document.querySelector('div#prices');

    if(enchantment == -1 || returnRate.length == 0) {
        errorMsgEl.innerText = 'Please, insert all data required.'
    } else {
        errorMsgEl.innerText = '';

        const material =[
            {resourceName: 'WOOD', refinedName: 'PLANKS'},
            {resourceName: 'ORE', refinedName: 'METALBAR'},
            {resourceName: 'FIBER', refinedName: 'CLOTH'},
            {resourceName: 'ROCK', refinedName: 'STONEBLOCK'},
            {resourceName: 'HIDE', refinedName: 'LEATHER'}];
        const cityName = selectCityEl[selectCityEl.selectedIndex].innerText;
        const mainItemName = `T${optionTierEl+3}_${material[optionMaterialEl].refinedName}${enchantment}`;
        const rawItemName = `T${optionTierEl+3}_${material[optionMaterialEl].resourceName}${enchantment}`;
        const subItemName = `T${optionTierEl+2}_${material[optionMaterialEl].refinedName}${enchantment}`;

        const rawItemImg = document.getElementById('img-item1');
        rawItemImg.setAttribute('src', `https://render.albiononline.com/v1/item/${rawItemName}`);
        const rawItemInput = document.getElementById('input-item1');
        rawItemInput.value = await getItemPrice(rawItemName, cityName);
        
        const subItemImg = document.getElementById('img-item2');
        subItemImg.setAttribute('src', `https://render.albiononline.com/v1/item/${subItemName}`);
        const subItemInput = document.getElementById('input-item2');
        subItemInput.value = await getItemPrice(subItemName, cityName);
        
        const mainItemImg = document.getElementById('img-item3');
        mainItemImg.setAttribute('src', `https://render.albiononline.com/v1/item/${mainItemName}`);
        const mainItemInput = document.getElementById('input-item3');
        mainItemInput.value = await getItemPrice(mainItemName, cityName);

        divPrices.style.display = 'initial';
        getProfit();
    }

};

const getCheckedRadio = elName => {
    const radiosName = document.getElementsByName(elName);
    for (let cur in radiosName) {
        if(radiosName[cur].checked) {
            let value = [];
            value[0] = (cur == 0)? '' : `_LEVEL${cur}@${cur}`;
            value.push(cur);
            return value;
        }
    }
    return -1;
}

const tier3Selected = () => {
    // Faz com que, caso o tier 3 esteja selecionado, desaparece com as opções de inserir encantamento, já que Tier 3 não possui encantamento e é sempre flat.
    const selectTierEl = document.querySelector('select#tier');
    const optionTierEl = selectTierEl.selectedIndex;
    const radiosName = document.getElementsByName('enchantment');
    const divLabelsEl = document.getElementsByTagName('label');

    if(optionTierEl == 0) {
        radiosName[0].checked = true;
        for (let cur = 1; cur < radiosName.length; cur++) {
            radiosName[cur].style.display = 'none';
            divLabelsEl[cur+1].style.display = 'none';
        }
    } else {
        for (let cur = 2; cur < divLabelsEl.length; cur++) {
            radiosName[cur-1].style.display = '';
            divLabelsEl[cur].style.display = '';
        }
    }
}

const getProfit = async () => {
    // Pega os dados do document e gera o lucro com base neles.
    const selectTierEl = document.querySelector('select#tier');
    const tier = selectTierEl.selectedIndex + 3;
    const enchantment = Number(getCheckedRadio('enchantment')[1]);
    const rawItemPrice = Number(document.querySelector('input#input-item1').value);
    const subItemPrice = Number(document.querySelector('input#input-item2').value);
    const mainItemPrice = Number(document.querySelector('input#input-item3').value);
    const returnRate = Number(document.querySelector('input#return-rate').value);
    const premium = document.querySelector('input#premium').checked;
    const usageFee = Number(document.querySelector('input#usage-fee').value);

    const itemValue = 2 ** (tier + enchantment);
    const trueReturn = 1 - (returnRate / 100);
    const marketFee = premium? mainItemPrice * 0.065 : mainItemPrice * 0.105;
    const refineCost = (itemValue * 0.1125) * (usageFee / 100);

    // crio a variavel custo dos recursos e a calculo com base no tier.
    let resourcesCost = 0;
    switch (tier) {
        case 3:
            resourcesCost = (2 * rawItemPrice + subItemPrice) * trueReturn;
            break;
        case 4:
            resourcesCost = (2 * rawItemPrice + subItemPrice) * trueReturn;
            break;
        case 5:
            resourcesCost = (3 * rawItemPrice + subItemPrice) * trueReturn;
            break;
        case 6: 
            resourcesCost = (4 * rawItemPrice + subItemPrice) * trueReturn;
            break;
        case 7:
            resourcesCost = (5 * rawItemPrice + subItemPrice) * trueReturn;
            break;
        case 8:
            resourcesCost = (5 * rawItemPrice + subItemPrice) * trueReturn;
            break;
    }
    const resourceCostsEl = document.querySelector('strong#resources-cost');
    resourceCostsEl.innerText = `-${resourcesCost.toFixed(0)}`;

    const marketFeesEl = document.querySelector('strong#market-fees');
    marketFeesEl.innerText = `-${marketFee.toFixed(0)}`;

    const usageFeeEl = document.querySelector('strong#strong-usage-fee');
    usageFeeEl.innerText = `-${refineCost.toFixed(0)}`;

    const earningsEl = document.querySelector('strong#earnings');
    if (mainItemPrice > 0) {
        earningsEl.style.color = 'green';
        earningsEl.innerText = `+${mainItemPrice.toFixed(0)}`;
    } else {
        earningsEl.style.color = 'red';
        earningsEl.innerText = `${mainItemPrice.toFixed(0)}`;
    }

    const totalProfitEl = document.querySelector('strong#total-profit');
    const profit = mainItemPrice - (resourcesCost + marketFee + refineCost);
    if (profit > 0) {
        totalProfitEl.style.color = 'green';
        totalProfitEl.innerText = `+${profit.toFixed(0)}`;
    } else {
        totalProfitEl.style.color = 'red';
        totalProfitEl.innerText = `${profit.toFixed(0)}`;
    }
}

