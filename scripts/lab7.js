import { network } from "hardhat";

async function main() {
    const { ethers, networkName } = await network.create();

    if (networkName !== "hardhatMainnet") {
        throw new Error("Використовуйте локальну мережу Hardhat");
    }

    const [deployer, user] = await ethers.getSigners();
    console.log("Network:", networkName);

    const GenericToken = await ethers.getContractFactory("GenericToken");
    const tokenA = await GenericToken.deploy("Base Asset", "BASE");
    await tokenA.waitForDeployment();
    const tokenAAddress = await tokenA.getAddress();

    const tokenB = await GenericToken.deploy("Reward Token", "RWRD");
    await tokenB.waitForDeployment();
    const tokenBAddress = await tokenB.getAddress();

    const RouterMock = await ethers.getContractFactory("UniswapV2RouterMock");
    const router = await RouterMock.deploy(tokenAAddress, tokenBAddress);
    await router.waitForDeployment();
    const routerAddress = await router.getAddress();

    await tokenA.mint(routerAddress, ethers.parseUnits("100000", 18));

    const Vault = await ethers.getContractFactory("AutoCompoundVault");
    const vault = await Vault.deploy(
        tokenAAddress,
        tokenBAddress,
        routerAddress,
        "Dziuba Vault Shares",
        "vDZB"
    );
    await vault.waitForDeployment();
    const vaultAddress = await vault.getAddress();
    console.log("Vault deployed:", vaultAddress);

    console.log("\n--- СИМУЛЯЦІЯ ЖИТТЄВОГО ЦИКЛУ ІНВЕСТОРА ---");

    const depositAmount = ethers.parseUnits("1000", 18);
    await tokenA.mint(user.address, depositAmount);

    const tokenAUser = tokenA.connect(user);
    const vaultUser = vault.connect(user);

    await tokenAUser.approve(vaultAddress, depositAmount);
    await vaultUser.deposit(depositAmount);

    const userShares = await vault.balanceOf(user.address);
    console.log(`1. Користувач поклав 1000 Token A.`);
    console.log(`   Отримано акцій (Shares): ${ethers.formatUnits(userShares, 18)} vDZB`);

    let assetsBefore = await vault.convertToAssets(userShares);
    console.log(`   Поточна вартість акцій: ${ethers.formatUnits(assetsBefore, 18)} Token A`);

    const rewardAmount = ethers.parseUnits("500", 18);
    await tokenB.mint(vaultAddress, rewardAmount);
    console.log(`\n2. Сховище отримало винагороду: 500 Token B (надіслано напряму)`);

    console.log(`\n3. Виклик функції compound() автономним ботом...`);
    await vault.compound();
    console.log(`   Обмін успішно виконано через Router.`);

    let assetsAfter = await vault.convertToAssets(userShares);
    console.log(`\n4. Вартість акцій після реінвестування: ${ethers.formatUnits(assetsAfter, 18)} Token A`);
    console.log(`   Чистий прибуток інвестора: ${ethers.formatUnits(assetsAfter - depositAmount, 18)} Token A`);
    console.log(`   Кількість акцій залишилася незмінною: ${ethers.formatUnits(userShares, 18)} vDZB`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});