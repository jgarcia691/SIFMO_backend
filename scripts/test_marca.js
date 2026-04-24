const marcaService = require('./src/marca/service');

async function testMarca() {
    try {
        console.log('Testing createMarca...');
        const newMarca = await marcaService.createMarca('Dell', 'Laptop');
        console.log('Created:', newMarca);

        console.log('Testing getMarcas...');
        const marcas = await marcaService.getMarcas();
        console.log('All Marcas:', marcas);

        console.log('Testing updateMarca...');
        await marcaService.updateMarca(newMarca.id, 'Dell Updated', 'Workstation');
        const updated = await marcaService.getMarcaById(newMarca.id);
        console.log('Updated:', updated);

        console.log('Testing deleteMarca...');
        await marcaService.deleteMarca(newMarca.id);
        const deleted = await marcaService.getMarcaById(newMarca.id);
        console.log('Deleted (should be null):', deleted);

        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testMarca();
