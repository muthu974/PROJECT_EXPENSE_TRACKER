const { Transaction } = require('../models/Transaction');

// GET /api/stats/monthly-trends?months=6
const getMonthlyTrends = async (req, res) => {
  try {
    const monthsBack = parseInt(req.query.months) || 6;

    const results = await Transaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Build a map of month -> { income, expense }
    const monthMap = {};
    results.forEach(({ _id, total }) => {
      const key = `${_id.year}-${String(_id.month).padStart(2, '0')}`;
      if (!monthMap[key]) monthMap[key] = { month: key, income: 0, expense: 0 };
      monthMap[key][_id.type] = total;
    });

    // Get last N months sorted
    const allMonths = Object.keys(monthMap).sort();
    const recentMonths = allMonths.slice(-monthsBack);
    const data = recentMonths.map((m) => monthMap[m]);

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Monthly trends error:', error.message);
    res.status(500).json({ success: false, message: 'Server error while fetching trends' });
  }
};

// GET /api/stats/top-categories?month=YYYY-MM
const getTopCategories = async (req, res) => {
  try {
    const { month } = req.query;
    const matchStage = { type: 'expense' };

    if (month) {
      const [year, mon] = month.split('-').map(Number);
      matchStage.date = {
        $gte: new Date(year, mon - 1, 1),
        $lte: new Date(year, mon, 0, 23, 59, 59, 999)
      };
    }

    const results = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 8 }
    ]);

    res.status(200).json({
      success: true,
      data: results.map((r) => ({ category: r._id, total: r.total, count: r.count }))
    });
  } catch (error) {
    console.error('Top categories error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getMonthlyTrends, getTopCategories };
