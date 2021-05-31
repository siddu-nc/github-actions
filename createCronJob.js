const fs = require('fs');
const Path = require('path');
const yaml = require('js-yaml')

const createCronTemplate = ({ fileName, cron }) => ({
   "name": 'schedule publish',
   "on": {
      "schedule": [
        {
          cron,
        }
      ],
   },
   "jobs": {
      "publish": {
         "runs-on": "ubuntu-latest",
         "steps": [
            {
               "name": "Checkout code",
               "uses": "actions/checkout@v1",
               "with": {
                  "ref": "master"
               }
            },
            {
               "name": "Use Node.js 12.x",
               "uses": "actions/setup-node@v1",
               "with": {
                  "node-version": "12.x"
               }
            },
            {
               "name": "Run Schedule Publish",
               "run": "node ./packages/studio/scripts/add.js"
            },
            {
              "name": "Remove the schedule yaml",
              "run": `rm ./.github/workflows/schedule/${fileName}.yml`
            }
         ]
      }
   }
})

function createCronJob() {

  const now = new Date();

  let yamlStr = yaml.dump(
     createCronTemplate({ name: now.toISOString(), cron: "4 * * * *" }), {forceQuotes: true});
   
  console.log(Path.join(process.cwd(), `/.github/workflows/${now.toISOString()}.yml`));   
  fs.writeFileSync(Path.join(__dirname, `./.github/workflows/name.yml`), yamlStr,{
    flag: 'w'
  },function(err){
    if(err){
      console.log(err);
    }
  } ,'utf8');
}


function generateYaml() {
  const now = new Date();
  let yamlStr = yaml.dump(
    createCronTemplate({ name: 'schedule ', cron: "4 * * * *" }), {forceQuotes: true});
  return yamlStr;
}

module.exports = {
  generateYaml,
};