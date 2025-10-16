const pool = require('../config/database');

// Balance Sheet (real data) - period-aware and gym-scoped
const getBalanceSheet = async (req, res) => {
  try {
    const gymId = req.user?.gym_id;
    if (!gymId) return res.status(400).json({ error: 'Bad Request', message: 'Gym ID is required' });
    const start = req.query.start || '1970-01-01';
    const end = req.query.end || new Date().toISOString().slice(0,10);

    const q = async (text, params) => (await pool.query(text, params)).rows?.[0] || {};

    const [
      cashRow,
      expRow,
      assetsRow,
      payablesRow,
      loansRow,
      recvRow,
      openingEquityRow
    ] = await Promise.all([
      q(`SELECT COALESCE(SUM(amount),0)::numeric AS v FROM payments WHERE gym_id=$1 AND status='completed' AND payment_date BETWEEN $2 AND $3`, [gymId, start, end]),
      q(`SELECT COALESCE(SUM(amount),0)::numeric AS v FROM expenses WHERE gym_id=$1 AND status IN ('approved','paid') AND date BETWEEN $2 AND $3`, [gymId, start, end]),
      q(`SELECT COALESCE(SUM(COALESCE(current_value, purchase_price)),0)::numeric AS v FROM assets WHERE gym_id=$1`, [gymId]),
      q(`SELECT COALESCE(SUM(amount - COALESCE(paid_amount,0)),0)::numeric AS v FROM expenses WHERE gym_id=$1 AND status IN ('approved','partial')`, [gymId]),
      q(`SELECT COALESCE(SUM(balance),0)::numeric AS v FROM loans WHERE gym_id=$1`, [gymId]).catch(()=>({ v: 0 })),
      q(`SELECT COALESCE(SUM(total - COALESCE(paid,0)),0)::numeric AS v FROM invoices WHERE gym_id=$1 AND status IN ('unpaid','partial')`, [gymId]).catch(()=>({ v: 0 })),
      q(`SELECT COALESCE(SUM(amount),0)::numeric AS v FROM owner_equity WHERE gym_id=$1`, [gymId]).catch(()=>({ v: 0 }))
    ]);

    const cash = Number(cashRow.v || 0);
    const expenses = Number(expRow.v || 0);
    const fixedAssets = Number(assetsRow.v || 0);
    const payables = Number(payablesRow.v || 0);
    const loans = Number(loansRow.v || 0);
    const receivables = Number(recvRow.v || 0);
    const openingEquity = Number(openingEquityRow.v || 0);

    const revenue = cash; // simple revenue proxy from payments
    const netProfit = revenue - expenses;
    const assets = cash + receivables + fixedAssets;
    const liabilities = loans + payables;
    const equity = openingEquity + netProfit; // retained earnings included

    return res.json({
      success: true,
      data: {
        period: { start, end },
        sections: {
          assets: { cash, receivables, fixedAssets, total: assets },
          liabilities: { loans, payables, total: liabilities },
          equity: { openingEquity, retainedEarnings: netProfit, total: equity }
        },
        totals: { assets, liabilities, equity },
        check: Math.abs(assets - (liabilities + equity)) < 0.01
      }
    });
  } catch (e) {
    console.error('getBalanceSheet error:', e);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to compute balance sheet' });
  }
};

const exportBalanceSheet = async (req, res) => {
  try {
    req.query = req.query || {};
    const format = (req.query.format || 'csv').toLowerCase();
    // reuse calculation
    const fakeReq = { ...req };
    const capture = await new Promise((resolve) => {
      const fakeRes = {
        json: (obj) => resolve(obj),
        status: () => fakeRes,
      };
      getBalanceSheet(fakeReq, fakeRes);
    });
    if (!capture?.success) return res.status(500).json({ error: 'Server Error', message: 'Export failed' });
    const d = capture.data;
    if (format === 'csv') {
      const rows = [
        ['Section','Account','Amount'],
        ['Assets','Cash', d.sections.assets.cash],
        ['Assets','Receivables', d.sections.assets.receivables],
        ['Assets','Fixed Assets', d.sections.assets.fixedAssets],
        ['Assets','Total', d.sections.assets.total],
        ['Liabilities','Loans', d.sections.liabilities.loans],
        ['Liabilities','Payables', d.sections.liabilities.payables],
        ['Liabilities','Total', d.sections.liabilities.total],
        ['Equity','Opening Equity', d.sections.equity.openingEquity],
        ['Equity','Retained Earnings', d.sections.equity.retainedEarnings],
        ['Equity','Total', d.sections.equity.total],
      ];
      const csv = rows.map(r => r.map(v => `"${String(v)}"`).join(',')).join('\n');
      res.setHeader('Content-Type','text/csv');
      res.setHeader('Content-Disposition',`attachment; filename=balance_sheet_${d.period.start}_to_${d.period.end}.csv`);
      return res.send(csv);
    }
    // default simple HTML for PDF via browser print
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Balance Sheet</title>
    <style>body{font-family:Arial;padding:16px} h1{margin:0 0 12px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #e5e7eb;padding:8px;text-align:left} th{background:#f9fafb}</style>
    </head><body>
    <h1>Balance Sheet</h1>
    <p>Period: ${d.period.start} to ${d.period.end}</p>
    <h3>Assets</h3>
    <table><tbody>
    <tr><td>Cash</td><td>${d.sections.assets.cash}</td></tr>
    <tr><td>Receivables</td><td>${d.sections.assets.receivables}</td></tr>
    <tr><td>Fixed Assets</td><td>${d.sections.assets.fixedAssets}</td></tr>
    <tr><th>Total Assets</th><th>${d.sections.assets.total}</th></tr>
    </tbody></table>
    <h3>Liabilities</h3>
    <table><tbody>
    <tr><td>Loans</td><td>${d.sections.liabilities.loans}</td></tr>
    <tr><td>Payables</td><td>${d.sections.liabilities.payables}</td></tr>
    <tr><th>Total Liabilities</th><th>${d.sections.liabilities.total}</th></tr>
    </tbody></table>
    <h3>Equity</h3>
    <table><tbody>
    <tr><td>Opening Equity</td><td>${d.sections.equity.openingEquity}</td></tr>
    <tr><td>Retained Earnings</td><td>${d.sections.equity.retainedEarnings}</td></tr>
    <tr><th>Total Equity</th><th>${d.sections.equity.total}</th></tr>
    </tbody></table>
    <p>Check Assets = Liabilities + Equity: ${d.check ? 'OK' : 'Mismatch'}</p>
    </body></html>`;
    res.setHeader('Content-Type','text/html');
    return res.send(html);
  } catch (e) {
    console.error('exportBalanceSheet error:', e);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to export balance sheet' });
  }
};

module.exports = { getBalanceSheet, exportBalanceSheet };


