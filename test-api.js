#!/usr/bin/env node

/**
 * Script de teste para API do Gil.Finanças
 *
 * Uso: node test-api.js
 *
 * Este script testa todos os endpoints da API
 */

const API_BASE_URL = 'http://localhost:5000';

let authToken = null;
let testClientId = null;
let testLoanId = null;

async function apiRequest(method, endpoint, data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (authToken) {
        options.headers.Authorization = `Bearer ${authToken}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const json = await response.json();
        return { status: response.status, data: json };
    } catch (error) {
        return { status: 0, error: error.message };
    }
}

async function testAuth() {
    console.log('\n📋 TESTE 1: AUTENTICAÇÃO\n');

    // Registrar novo usuário
    console.log('➜ Registrando novo usuário...');
    const registerRes = await apiRequest('POST', '/auth/register', {
        email: `teste-${Date.now()}@example.com`,
        password: 'TesteSenha123!',
        name: 'Teste User',
        phone: '(11) 99999-9999'
    });

    if (registerRes.status === 201) {
        console.log('✅ Usuário registrado com sucesso');
        authToken = registerRes.data.token;
        console.log(`✅ Token obtido: ${authToken.substring(0, 20)}...`);
    } else {
        console.log('❌ Erro ao registrar:', registerRes.data?.error);
        return false;
    }

    // Testar login
    console.log('\n➜ Testando login...');
    const loginRes = await apiRequest('POST', '/auth/login', {
        email: registerRes.data.user.email,
        password: 'TesteSenha123!'
    });

    if (loginRes.status === 200) {
        console.log('✅ Login realizado com sucesso');
        authToken = loginRes.data.token;
    } else {
        console.log('❌ Erro ao fazer login:', loginRes.data?.error);
        return false;
    }

    return true;
}

async function testClients() {
    console.log('\n📋 TESTE 2: GESTÃO DE CLIENTES\n');

    // Criar cliente
    console.log('➜ Criando novo cliente...');
    const createRes = await apiRequest('POST', '/clients', {
        name: 'João Silva Teste',
        email: 'joao.teste@example.com',
        phone: '(11) 98765-4321',
        whatsapp: '(11) 99876-5432',
        address: 'Rua Teste, 123 - São Paulo, SP'
    });

    if (createRes.status === 201) {
        console.log('✅ Cliente criado com sucesso');
        testClientId = createRes.data.client.id;
        console.log(`   ID: ${testClientId}`);
    } else {
        console.log('❌ Erro ao criar cliente:', createRes.data?.error);
        return false;
    }

    // Listar clientes
    console.log('\n➜ Listando clientes...');
    const listRes = await apiRequest('GET', '/clients');

    if (listRes.status === 200) {
        console.log(`✅ ${listRes.data.length} cliente(s) encontrado(s)`);
    } else {
        console.log('❌ Erro ao listar clientes:', listRes.data?.error);
        return false;
    }

    // Obter cliente específico
    console.log('\n➜ Obtendo cliente específico...');
    const getRes = await apiRequest('GET', `/clients/${testClientId}`);

    if (getRes.status === 200) {
        console.log(`✅ Cliente encontrado: ${getRes.data.name}`);
    } else {
        console.log('❌ Erro ao obter cliente:', getRes.data?.error);
        return false;
    }

    // Atualizar cliente
    console.log('\n➜ Atualizando cliente...');
    const updateRes = await apiRequest('PUT', `/clients/${testClientId}`, {
        name: 'João Silva Teste (Atualizado)'
    });

    if (updateRes.status === 200) {
        console.log('✅ Cliente atualizado com sucesso');
    } else {
        console.log('❌ Erro ao atualizar cliente:', updateRes.data?.error);
        return false;
    }

    return true;
}

async function testLoans() {
    console.log('\n📋 TESTE 3: GESTÃO DE EMPRÉSTIMOS\n');

    // Criar empréstimo
    console.log('➜ Criando novo empréstimo...');
    const createRes = await apiRequest('POST', '/loans', {
        clientId: testClientId,
        amount: 2500,
        rate: 1.5,
        period: 'diario',
        interestType: 'simple'
    });

    if (createRes.status === 201) {
        console.log('✅ Empréstimo criado com sucesso');
        testLoanId = createRes.data.loan.id;
        console.log(`   ID: ${testLoanId}`);
        console.log(`   Valor: R$ ${createRes.data.loan.amount.toFixed(2)}`);
        console.log(`   Taxa: ${createRes.data.loan.rate}% ao ${createRes.data.loan.period}`);
    } else {
        console.log('❌ Erro ao criar empréstimo:', createRes.data?.error);
        return false;
    }

    // Listar empréstimos
    console.log('\n➜ Listando empréstimos...');
    const listRes = await apiRequest('GET', '/loans');

    if (listRes.status === 200) {
        console.log(`✅ ${listRes.data.length} empréstimo(s) encontrado(s)`);
        if (listRes.data.length > 0) {
            const loan = listRes.data[0];
            console.log(`   Juros acumulados: R$ ${loan.accumulatedInterest?.toFixed(2) || 0}`);
            console.log(`   Total devido: R$ ${loan.totalDue?.toFixed(2) || loan.amount}`);
        }
    } else {
        console.log('❌ Erro ao listar empréstimos:', listRes.data?.error);
        return false;
    }

    // Obter empréstimo com cálculo de juros
    console.log('\n➜ Obtendo empréstimo com juros calculados...');
    const getRes = await apiRequest('GET', `/loans/${testLoanId}`);

    if (getRes.status === 200) {
        console.log(`✅ Empréstimo encontrado`);
        console.log(`   Juros acumulados: R$ ${getRes.data.accumulatedInterest?.toFixed(2) || 0}`);
        console.log(`   Total devido: R$ ${getRes.data.totalDue?.toFixed(2)}`);
    } else {
        console.log('❌ Erro ao obter empréstimo:', getRes.data?.error);
        return false;
    }

    return true;
}

async function testPayments() {
    console.log('\n📋 TESTE 4: SISTEMA DE PAGAMENTOS\n');

    // Registrar pagamento
    console.log('➜ Registrando novo pagamento...');
    const createRes = await apiRequest('POST', '/payments', {
        loanId: testLoanId,
        amount: 500,
        paymentDate: new Date().toISOString(),
        method: 'pix'
    });

    if (createRes.status === 201) {
        console.log('✅ Pagamento registrado com sucesso');
        console.log(`   Valor: R$ ${createRes.data.payment.amount.toFixed(2)}`);
        console.log(`   Método: ${createRes.data.payment.method.toUpperCase()}`);
    } else {
        console.log('❌ Erro ao registrar pagamento:', createRes.data?.error);
        return false;
    }

    // Listar pagamentos
    console.log('\n➜ Listando pagamentos...');
    const listRes = await apiRequest('GET', '/payments');

    if (listRes.status === 200) {
        console.log(`✅ ${listRes.data.length} pagamento(s) encontrado(s)`);
    } else {
        console.log('❌ Erro ao listar pagamentos:', listRes.data?.error);
        return false;
    }

    return true;
}

async function testDashboard() {
    console.log('\n📋 TESTE 5: DASHBOARD\n');

    console.log('➜ Obtendo estatísticas...');
    const res = await apiRequest('GET', '/dashboard');

    if (res.status === 200) {
        const stats = res.data.stats;
        console.log('✅ Dashboard carregado com sucesso');
        console.log(`   Clientes: ${stats.totalClients}`);
        console.log(`   Empréstimos: ${stats.totalLoans}`);
        console.log(`   Empréstimos ativos: ${stats.activeLoans}`);
        console.log(`   Total emprestado: R$ ${stats.totalLoaned.toFixed(2)}`);
        console.log(`   Total recebido: R$ ${stats.totalPayments.toFixed(2)}`);
        console.log(`   Total a receber: R$ ${stats.totalDue.toFixed(2)}`);
    } else {
        console.log('❌ Erro ao obter dashboard:', res.data?.error);
        return false;
    }

    return true;
}

async function testExport() {
    console.log('\n📋 TESTE 6: EXPORTAÇÃO\n');

    console.log('➜ Testando exportação CSV...');
    const res = await apiRequest('GET', '/export/csv');

    if (res.status === 200) {
        console.log('✅ CSV exportado com sucesso');
        // Mostra os primeiros 200 caracteres
        console.log(`   Tamanho: ${res.data.length} caracteres`);
        console.log(`   Amostra:\n${res.data.substring(0, 150)}...`);
    } else {
        console.log('❌ Erro ao exportar CSV:', res.data?.error);
        return false;
    }

    return true;
}

async function testAlerts() {
    console.log('\n📋 TESTE 7: ALERTAS\n');

    console.log('➜ Verificando alertas de cobranças...');
    const res = await apiRequest('GET', '/alerts');

    if (res.status === 200) {
        console.log(`✅ ${res.data.length} alerta(s)`);
        if (res.data.length > 0) {
            res.data.forEach(alert => {
                console.log(`   - ${alert.message} (Severidade: ${alert.severity})`);
            });
        } else {
            console.log('   Nenhum alerta pendente');
        }
    } else {
        console.log('❌ Erro ao obter alertas:', res.data?.error);
        return false;
    }

    return true;
}

async function cleanup() {
    console.log('\n📋 TESTE 8: LIMPEZA\n');

    if (!testClientId) {
        console.log('⏭️  Nenhum cliente para deletar');
        return true;
    }

    console.log('➜ Deletando cliente de teste...');
    const res = await apiRequest('DELETE', `/clients/${testClientId}`);

    if (res.status === 200) {
        console.log('✅ Cliente deletado com sucesso');
    } else {
        console.log('⚠️  Erro ao deletar cliente (pode ser normal)');
    }

    return true;
}

async function runAllTests() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                                                            ║');
    console.log('║           🧪 TESTE COMPLETO DA API GIL.FINANÇAS 🧪        ║');
    console.log('║                                                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    let passed = 0;
    let failed = 0;

    const tests = [
        { name: 'Autenticação', fn: testAuth },
        { name: 'Clientes', fn: testClients },
        { name: 'Empréstimos', fn: testLoans },
        { name: 'Pagamentos', fn: testPayments },
        { name: 'Dashboard', fn: testDashboard },
        { name: 'Exportação', fn: testExport },
        { name: 'Alertas', fn: testAlerts },
        { name: 'Limpeza', fn: cleanup }
    ];

    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.error(`❌ Erro não capturado em ${test.name}:`, error.message);
            failed++;
        }
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                      RESULTADO FINAL                       ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║ ✅ Testes aprovados: ${passed}/8`.padEnd(61) + '║');
    console.log(`║ ❌ Testes falhados: ${failed}/8`.padEnd(61) + '║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    process.exit(failed > 0 ? 1 : 0);
}

// Verificar se servidor está rodando
async function checkServer() {
    try {
        const response = await fetch(API_BASE_URL, { timeout: 5000 });
    } catch (error) {
        console.error('\n❌ ERRO: Servidor não está rodando!');
        console.error(`\nTente executar em outro terminal:`);
        console.error('  npm start\n');
        process.exit(1);
    }
}

// Executar testes
checkServer().then(runAllTests);
