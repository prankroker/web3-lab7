import { network } from "hardhat";

async function main() {
    console.log("Ініціалізація крос-чейн транзакції...");

    const { ethers } = await network.create();

    const messengerAddress = "0xaE480A7e212B823E52c484Ddd8a6CcD8f9Ca8443";

    const receiverAddress = "0xdacBB6906eB00010607a44eA55f085B57a818A91";

    const arbitrumSepoliaSelector = "3478487238524512106";

    const messageText = "Привіт, Arbitrum! Це тестове крос-чейн повідомлення.";

    const Messenger = await ethers.getContractFactory("CrossChainMessenger");
    const messenger = Messenger.attach(messengerAddress);

    console.log("Відправляємо повідомлення через CCIP Router...");

    const tx = await messenger.sendMessage(
        arbitrumSepoliaSelector,
        receiverAddress,
        messageText
    );

    console.log(`Транзакцію відправлено! Хеш: ${tx.hash}`);
    console.log("Очікуємо підтвердження блоку в мережі Sepolia...");

    const receipt = await tx.wait();

    console.log(`\n[УСПІХ] Транзакцію включено у блок L1 (Номер: ${receipt.blockNumber})`);
    console.log("Тепер ти можеш відстежити статус доставки до мережі Arbitrum за цим посиланням:");
    console.log(`https://ccip.chain.link/tx/${tx.hash}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});