"use strict";
const User = require("../userModel");

const axios = require("axios");
const services = require("./balance");
class transaction {
  constructor() {
    this.transaction = {};
    this.transaction.unit = "";
  }

  //Get transaction details APIs

  async getTransaction(callback) {
    try {
      const res = await axios.get(services.balance);
      const con = await axios.get(services.contractN);

      const vall = await axios.get(services.values);
      const val = await axios.get(
        `https://api.unmarshal.com/v1/ethereum/address/${res.data.result[0].from}/assets?verified=true&chainId=false&token=false&auth_key=xJ4Xs6Nbwx2EChON3PNFO26gJSpw6vEm9mg097IU`
      );

      const coun = await axios.get(
        `https://api.unmarshal.com/v1/ethereum/address/${res.data.result[0].from}/transactions/count?auth_key=xJ4Xs6Nbwx2EChON3PNFO26gJSpw6vEm9mg097IU`
      );
      // const respons = await axios.get(
      //   "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=BUILD",
      //   {
      //     headers: {
      //       "X-CMC_PRO_API_KEY": "98faa061-7512-412a-a012-9866c329b3c4",
      //     },
      //   }
      // );
      const priceS = await axios.get(
        `https://api.unmarshal.com/v1/pricestore/chain/ethereum/0x410e7696dF8Be2a123dF2cf88808c6ddAb2ae2BF?timestamp=${vall.data.transactions[0].date}&auth_key=xJ4Xs6Nbwx2EChON3PNFO26gJSpw6vEm9mg097IU`
      );
      const supplyS = await axios.get(services.supply);
      axios.all([res, con, vall, val, coun, priceS, supplyS]).then(
        axios.spread((...responses) => {
          const { hash } = responses[0]?.data?.result[0] || {};
          const { ContractName } = responses[1]?.data?.result[0] || {};

          const { date, type, description, sent } =
            responses[2].data.transactions[0] || {};

          // const { received } = responses[2].data.transactions[0] || {};

          const { balance } = responses[3]?.data[0] || {};

          const { total_transaction_count } = responses[4]?.data || {};
          const { price } = responses[5]?.data;
          console.log(price);

          const { total_supply } = responses[6].data;
          console.log(total_supply);
          let recieved = description.split(" ");

          console.log(date);

          // Sending ALert details
          this.transaction.lastValue = date;
          if (sent.length === 2) {
            if (this.transaction.unit == date) {
              return;
            }
            let value1 = Number(sent[0].value);
            let value2 = Number(sent[1].value);
            let sum = value1 + value2;
            User.find((error, data) => {
              if (error) {
                console.log(error);
              } else {
                if (sum * price <= data[0].step) {
                  callback(
                    `<b>${ContractName} Buy</b>\n${
                      data[0].emoji
                    }\n<b>Spent</b>: ${(sum * price).toLocaleString(
                      "fullwide",
                      {
                        useGrouping: false,
                      }
                    )} USD \n<b>Got</b>: ${sum.toLocaleString("fullwide", {
                      useGrouping: false,
                    })} ${sent[0].symbol}\n<b>Buyer ETH Value</b>: ${(
                      balance /
                      10 ** 18
                    ).toFixed(
                      7
                    )} \n<b>Buyer Position</b>: N\A\n<b>Buy # </b>:${total_transaction_count}\n<b>Price</b>:$${price} \n<b>MCap</b>: $ ${(
                      price * total_supply
                    ).toFixed(
                      4
                    )}\n<b>Whale Status</b>: N\A\n<b>Token Rank</b>: N\A\n<a href="https://etherscan.io/tx/${hash}"><b>TX</b></a> |  <a href="https://dextools.io/"><b>Chart</b></a> |  <a href="${
                      data[0].telegram
                    }"><b>Telegram</b></a> |  <a href="https://app.uniswap.org/#/swap?&chain=mainnet&use=v2&outputCurrency=0x410e7696dF8Be2a123dF2cf88808c6ddAb2ae2BF"><b>Uniswap</b></a>`
                  );
                } else if (
                  sum * price < data[0].step + data[0].step &&
                  sum * price > data[0].step
                ) {
                  callback(
                    `<b>${ContractName} Buy</b>\n${data[0].emoji}${
                      data[0].emoji
                    }\n<b>Spent</b>: ${(recieved[1] * price).toPrecision(
                      4
                    )} USD \n<b>Got</b>: ${recieved[1]} ${
                      recieved[2]
                    }\n<b>Buyer ETH Value</b>: ${(balance / 10 ** 18).toFixed(
                      7
                    )} \n<b>Buyer Position</b>: N\A\n<b>Buy # </b>:${total_transaction_count}\n<b>Price</b>:$${price} \n<b>MCap</b>: $ ${(
                      price * total_supply
                    ).toFixed(
                      4
                    )}\n<b>Whale Status</b>: N\A\n<b>Token Rank</b>: N\A\n<a href="https://etherscan.io/tx/${hash}"><b>TX</b></a> |  <a href="https://dextools.io/"><b>Chart</b></a> |  <a href="${
                      data[0].telegram
                    }"><b>Telegram</b></a> |  <a href="https://app.uniswap.org/#/swap?&chain=mainnet&use=v2&outputCurrency=0x410e7696dF8Be2a123dF2cf88808c6ddAb2ae2BF"><b>Uniswap</b></a>`
                  );
                } else if (
                  sum * price > data[0].step + data[0].step &&
                  sum * price < data[0].step + data[0].step + data[0].step
                ) {
                  callback(
                    `<b>${ContractName} Buy</b>\n${data[0].emoji}${
                      data[0].emoji
                    }${data[0].emoji}\n<b>Spent</b>: ${(
                      recieved[1] * price
                    ).toPrecision(4)} USD \n<b>Got</b>: ${recieved[1]} ${
                      recieved[2]
                    }\n<b>Buyer ETH Value</b>: ${(balance / 10 ** 18).toFixed(
                      7
                    )} \n<b>Buyer Position</b>: N\A\n<b>Buy # </b>:${total_transaction_count}\n<b>Price</b>:$${price} \n<b>MCap</b>: $ ${(
                      price * total_supply
                    ).toFixed(
                      4
                    )}\n<b>Whale Status</b>: N\A\n<b>Token Rank</b>: N\A\n<a href="https://etherscan.io/tx/${hash}"><b>TX</b></a> |  <a href="https://dextools.io/"><b>Chart</b></a> |  <a href="${
                      data[0].telegram
                    }"><b>Telegram</b></a> |  <a href="https://app.uniswap.org/#/swap?&chain=mainnet&use=v2&outputCurrency=0x410e7696dF8Be2a123dF2cf88808c6ddAb2ae2BF"><b>Uniswap</b></a>`
                  );
                } else {
                  callback(
                    `<b>${ContractName} Buy</b>\n${data[0].emoji}${
                      data[0].emoji
                    }${data[0].emoji}${data[0].emoji}${
                      data[0].emoji
                    }\n<b>Spent</b>: ${(recieved[1] * price).toPrecision(
                      4
                    )} USD \n<b>Got</b>: ${recieved[1]} ${
                      recieved[2]
                    }\n<b>Buyer ETH Value</b>: ${(balance / 10 ** 18).toFixed(
                      7
                    )} \n<b>Buyer Position</b>: N\A\n<b>Buy # </b>:${total_transaction_count}\n<b>Price</b>:$${price} \n<b>MCap</b>: $ ${(
                      price * total_supply
                    ).toFixed(
                      4
                    )}\n<b>Whale Status</b>: N\A\n<b>Token Rank</b>: N\A\n<a href="https://etherscan.io/tx/${hash}"><b>TX</b></a> |  <a href="https://dextools.io/"><b>Chart</b></a> |  <a href="${
                      data[0].telegram
                    }"><b>Telegram</b></a> |  <a href="https://app.uniswap.org/#/swap?&chain=mainnet&use=v2&outputCurrency=0x410e7696dF8Be2a123dF2cf88808c6ddAb2ae2BF"><b>Uniswap</b></a>`
                  );
                }
              }
            });
          } else {
          }
          this.transaction.unit = date;
        })
      );
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = transaction;
