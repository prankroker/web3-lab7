import { network } from "hardhat";

async function main() {
    console.log("Ініціалізація розгортання в мережі Arbitrum Sepolia...");

    const { ethers } = await network.create();

    const routerAddress = "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165";

    const Receiver = await ethers.getContractFactory("ReceiverMock");
    const receiver = await Receiver.deploy(routerAddress);

    await receiver.waitForDeployment();
    const receiverAddress = await receiver.getAddress();

    console.log(`[УСПІХ] ReceiverMock розгорнуто на L2 за адресою: ${receiverAddress}`);
    console.log("ЗБЕРЕЖІТЬ ЦЮ АДРЕСУ! Вона знадобиться для відправки повідомлення.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});