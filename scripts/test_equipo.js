const equipoService = require('./src/equipo/service');

async function testEquipo() {
    try {
        const testFmo = 999999;
        console.log('Testing createEquipo...');
        const newEquipo = await equipoService.createEquipo(testFmo, 1, 'Monitor Samsung', 'SN123456', 1);
        console.log('Created:', newEquipo);

        console.log('Testing getEquipos...');
        const equipos = await equipoService.getEquipos();
        console.log('Total Equipos:', equipos.length);

        console.log('Testing getEquipoByFmo...');
        const equipo = await equipoService.getEquipoByFmo(testFmo);
        console.log('Found:', equipo);

        console.log('Testing updateEquipo...');
        await equipoService.updateEquipo(testFmo, 1, 'Monitor Samsung Curvo', 'SN123456-UPD', 1);
        const updated = await equipoService.getEquipoByFmo(testFmo);
        console.log('Updated:', updated);

        console.log('Testing deleteEquipo...');
        await equipoService.deleteEquipo(testFmo);
        const deleted = await equipoService.getEquipoByFmo(testFmo);
        console.log('Deleted (should be undefined):', deleted);

        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testEquipo();
