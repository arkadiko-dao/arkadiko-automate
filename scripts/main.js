require('dotenv').config();
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const fetch = require('node-fetch');
const url = 'https://stacks-node-api.mainnet.stacks.co/v2/info';

// fs = require('fs');
// fs.writeFile(filename, data, [encoding], [callback]);

const exec = async () => {
  response = await fetch(url, { credentials: 'omit' });
  data = await response.json();

  console.log(data);
};

exec();
