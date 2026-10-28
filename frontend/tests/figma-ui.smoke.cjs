// Run against the local Postman simulation; never intercepts browser HTTP requests.
const { chromium } = require(process.env.UI_TEST_TOOLS + '/node_modules/@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const out = path.join(__dirname, '../test-results/figma');
fs.mkdirSync(out, { recursive: true });
const base = process.env.UI_TEST_URL || 'http://127.0.0.1:5174';
(async () => {
 const reset=await fetch('http://127.0.0.1:4900/backend/api/__reset',{method:'POST',headers:{Authorization:'Bearer fixture-ADMIN'}});assert(reset.ok,'simulation reset');
 const browser = await chromium.launch({headless:true});
 const errors=[]; const writes=[];
 async function session(role, mobile=false) {
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1024}});
  if(role)await context.addInitScript(role=>localStorage.setItem('accessToken','fixture-'+role),role);
  const page=await context.newPage(); page.setDefaultTimeout(12000);
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(['PUT','POST'].includes(r.method())&&r.url().includes('/backend/api/'))writes.push({method:r.method(),url:r.url(),body:r.postDataJSON()});});
  return page;
 }
 async function shot(page,name){await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,name+' horizontal overflow');}
 const login=await session();await login.goto(base+'/login');await login.getByLabel('Email hoặc tên đăng nhập').fill('admin');await login.getByLabel('Mật khẩu',{exact:true}).fill('fixture-password');
 await shot(login,'login-desktop');await login.getByRole('button',{name:'Đăng nhập',exact:true}).click();await login.waitForURL('**/dashboard');await login.getByText('SHP-1',{exact:true}).waitFor();await shot(login,'admin-desktop');
 await login.goto(base+'/inventory');await login.getByRole('button',{name:'Điều chỉnh',exact:true}).click();await login.getByLabel('Số lượng tồn').fill('10');await login.getByLabel('Số lượng đặt trước').fill('20');await login.getByRole('button',{name:'Lưu điều chỉnh'}).click();await login.getByRole('alert').waitFor();assert.equal(writes.filter(w=>w.url.endsWith('/inventory/1')).length,0);
 await login.getByLabel('Số lượng tồn').fill('250');await login.getByRole('button',{name:'Lưu điều chỉnh'}).click();await login.getByRole('dialog').waitFor({state:'hidden'});assert.deepEqual(writes.find(w=>w.url.endsWith('/inventory/1')).body,{quantity:250,reservedQuantity:20});await login.reload();await login.getByRole('cell',{name:'250',exact:true}).waitFor();
 await login.goto(base+'/settings');await login.getByLabel('Tên doanh nghiệp').fill('SmartLogistics kiểm thử');await login.getByRole('button',{name:'Lưu thay đổi'}).click();await login.getByText('Đã lưu cấu hình.').waitFor();await login.reload();assert.equal(await login.getByLabel('Tên doanh nghiệp').inputValue(),'SmartLogistics kiểm thử');
 const customer=await session('CUSTOMER');await customer.goto(base+'/customer-dashboard');await customer.getByText('ORD-2047',{exact:true}).click();await customer.waitForURL('**/orders/1');await customer.getByRole('dialog').waitFor();await customer.keyboard.press('Escape');await customer.getByRole('dialog').waitFor({state:'hidden'});
 await customer.goto(base+'/tracking/1');await customer.getByText('ORD-2047',{exact:false}).first().waitFor();assert.equal(await customer.getByRole('button',{name:/Bật GPS/}).count(),0);
 await customer.goto(base+'/customer-dashboard');await shot(customer,'customer-desktop');
 await customer.goto(base+'/customer-dashboard?create=1');await customer.getByRole('dialog').waitFor();await customer.getByLabel('Địa chỉ lấy hàng').fill('12 Đường thử nghiệm');await customer.getByLabel('Địa chỉ giao hàng').fill('86 Đường giao hàng');await customer.locator('select[name="product"]').selectOption('1');await customer.getByRole('button',{name:'+ Thêm',exact:true}).click();const created=customer.waitForResponse(r=>r.request().method()==='POST'&&r.url().endsWith('/orders'));await customer.getByRole('button',{name:'Gửi yêu cầu giao hàng'}).click();assert.equal((await created).status(),201);await customer.getByRole('dialog').waitFor({state:'hidden'});assert(writes.some(w=>w.url.endsWith('/orders')&&w.body.items[0].productId===1));
 const driver=await session('DRIVER',true);await driver.goto(base+'/driver-dashboard');await driver.getByRole('link',{name:'Tiếp tục chuyến'}).waitFor();await shot(driver,'driver-mobile');await driver.getByRole('button',{name:'Xác nhận đã giao',exact:true}).click();await driver.getByRole('dialog').getByRole('button',{name:'Xác nhận đã giao',exact:true}).click();await driver.getByRole('dialog').waitFor({state:'hidden'});assert(writes.some(w=>w.url.endsWith('/shipments/1/status')&&w.body.status==='DELIVERED'));
 await driver.goto(base+'/users');await driver.waitForURL('**/access-denied');await shot(driver,'access-denied-mobile');
 const mobile=await session('CUSTOMER',true);await mobile.goto(base+'/customer-dashboard');await mobile.getByText('ORD-2047',{exact:true}).waitFor();await shot(mobile,'customer-mobile');
 for(const route of ['orders','shipments','warehouses','products','drivers','vehicles','users','roles','customers','notifications','reports','account']){await login.goto(base+'/'+route);await login.locator('main h1, main h2').first().waitFor();await login.waitForTimeout(150);assert(await login.locator('main').innerText(),route+' rendered');}
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({passed:true,checked:['login','inventory validation and persistence','settings persistence','customer detail navigation','customer GPS isolation','driver delivery','RBAC','responsive overflow','12 route smoke checks'],writes,errors},null,2));
 await browser.close();console.log('PASS: frontend flows, API writes, roles, responsive layouts; screenshots in '+out);
})().catch(e=>{console.error(e);process.exit(1);});



