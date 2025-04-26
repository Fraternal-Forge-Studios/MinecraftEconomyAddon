# Minecraft Economy Addon
This addon adds an economy for blocks to minecraft. 
It adds a market to buy and sell blocks based on availability of blocks in the world.

## Development Setup

### Install Node.js, if you haven't already

We're going to use the Node Package Manager (or NPM) to get more tools to make the process of building our project easier.

Visit [https://nodejs.org/](https://nodejs.org).

Download the version with "LTS" next to the number and install it. (LTS stands for Long Term Support, if you're curious.) You do not need to install any additional tools for Native compilation.

### Install Visual Studio Code, if you haven't already

Visit the [Visual Studio Code website](https://code.visualstudio.com) and install Visual Studio Code.

## Getting Started

1. Clone current project with git. This will get you all mods by Fraternal Forge
```
git clone https://github.com/Ubiquitouskiwi/fraternal-forge.git
```
2. Navigate to the folder. This is the working directory for this Minecraft Addon
```
fraternal-forge/Minecraft/MinecraftEconomy
```
3. Run NPM to install packages
```
npm i
```
4. Open project up with Visual Studio Code

## Testing


To get started, go into PowerShell and navigate to your **fraternal-forge/Minecraft/MinecraftEconomy** directory.
Run this command:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Run this one, too.

```powershell
npm run local-deploy
```

This uses a build tool called just-scripts and automatically compiles your TypeScript project and pushes it over into Minecraft.

Launch Minecraft and create a new world:

1. Call it **Minecraft Economy Test**.
1. Select a Creative game mode.
1. Select a Flat world option, under the Advanced section of the Create New World screen.
1. Under Behavior Packs, under Available, you should see your Cotta Behavior Pack. Select it and Activate it.
1. Create the world and go into it.

Now you're in. Great!

By default, this starter pack comes with a simple script that will display a message every five seconds:

`[Script Engine] Hello starter! Tick: <number>`

This means your behavior pack is working and your tools for compiling and pushing TypeScript are just fine. Awesome!