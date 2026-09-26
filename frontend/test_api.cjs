const axios = require('axios');

async function test() {
    try {
        const loginRes = await axios.post('http://127.0.0.1:8000/api/admin/login', {
            email: 'admin@cafeflow.vn',
            password: 'password'
        });
        const token = loginRes.data.data.token;
        console.log("Token:", token);

        const rolesRes = await axios.get('http://127.0.0.1:8000/api/admin/roles', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Roles status:", rolesRes.status);
        
        const permsRes = await axios.get('http://127.0.0.1:8000/api/admin/permissions', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Perms status:", permsRes.status);
        
        const shiftsRes = await axios.get('http://127.0.0.1:8000/api/admin/work-shifts', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Shifts status:", shiftsRes.status);
        
    } catch (e) {
        console.error(e.response ? e.response.status + " " + e.response.statusText : e.message);
        if (e.response) console.error(e.response.data);
    }
}
test();
