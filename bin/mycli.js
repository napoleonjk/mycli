#!/usr/bin/env node
const path = require("path");
const program = require('commander');//cmd控制台交互
const ora = require('ora');//进度条
const chalk = require('chalk');//给提示文案着色
const download = require('download-git-repo');//拉取github项目
const fs = require('fs');
const minimist = require('minimist')

// 提示样式
const success = chalk.blueBright;
const error = chalk.bold.red;

const templateUrl = 'github:napoleonjk/tmp-vue3-template#main';//github项目地址

// 替换模板package.json文件的name字段
const changePackage = (appName) => {
    fs.readFile(`${process.cwd()}/${appName}/package.json`, (err, data) => {
        if (err) throw err;
        let _data = JSON.parse(data.toString());
        _data.name = appName;
        _data.version = '1.0.0';
        let str = JSON.stringify(_data, null, 4);
        fs.writeFile(`${process.cwd()}/${appName}/package.json`, str, function (err) {
            if (err) throw err;
        })
    });
};

program
    .version(`my-cli ${require('../package').version}`)
    .usage('<command> [options]')

program.command('init <app-name>')
    .description('generate a project from a remote template (legacy API, requires mycli-init)')
    .option('-i, init [name]', '初始化项目')
    .action(async (args) => {
        const arr=process.argv.slice(3);
        if (minimist(arr)._.length > 1) {
            console.log(chalk.yellow('\n Info: You provided more than one argument. The first one will be used as the app\'s name, the rest are ignored.'));
        }
        const spinner = ora('正在拉取模板...').start();//开启进度条
        const appName=arr[0];
        const dir = path.join(process.cwd(),appName);
        download(templateUrl, dir, { clone: true }, function (err) {
            // 拉取项目代码
            if (!err) {
                spinner.succeed(success('拉取成功'));
                //更改 package.json 中的 name 和版本号
                changePackage(appName);
                spinner.succeed(success('项目初始化成功'));
                spinner.succeed(success(`cd ${appName}`));
                spinner.succeed(success('npm install && npm run serve'));
            } else {
                console.log(err);
                spinner.fail(error('拉取失败'));
            }
        });
    })

program.parse(process.argv)