import { network } from "hardhat";

async function main() {
    console.log("Ініціалізація розгортання в мережі Ethereum Sepolia...");

    const { ethers } = await network.create();

    const routerAddress = "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59";
    const linkTokenAddress = "0x779877A7B0D9E8603169DdbD7836e478b4624789";

    const Messenger = await ethers.getContractFactory("CrossChainMessenger");
    const messenger = await Messenger.deploy(routerAddress, linkTokenAddress);

    await messenger.waitForDeployment();
    const messengerAddress = await messenger.getAddress();

    console.log(`[УСПІХ] CrossChainMessenger розгорнуто на L1 за адресою: ${messengerAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});