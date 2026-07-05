import { sql, ensureSchema, checkAdminPassword } from './_db.js';

const PAID_STATUSES = ['paid', 'shipped', 'delivered'];

export default async function handler(req, res) {
  try {
    if (!sql) return res.status(503).json({ error: 'Database not connected yet' });
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method not allowed' }); }
    if (!checkAdminPassword(req)) return res.status(401).json({ error: 'Unauthorized' });
    await ensureSchema();

    const [
      [revenue],
      topProducts,
      topCategories,
      [catalogTotals],
      catalogByCategory,
      topEnquired,
      recentActivity,
    ] = await Promise.all([
      sql`
        SELECT
          COALESCE(SUM(total) FILTER (WHERE created_at >= date_trunc('day', now())), 0) AS today,
          COALESCE(SUM(total) FILTER (WHERE created_at >= date_trunc('month', now())), 0) AS this_month,
          COALESCE(SUM(total), 0) AS all_time
        FROM orders
        WHERE status = ANY(${PAID_STATUSES})
      `,
      sql`
        SELECT item->>'name' AS name,
               SUM((item->>'qty')::int) AS qty,
               SUM((item->>'price')::int * (item->>'qty')::int) AS revenue
        FROM orders o
        CROSS JOIN LATERAL jsonb_array_elements(o.items) AS item
        WHERE o.status = ANY(${PAID_STATUSES})
        GROUP BY item->>'name'
        ORDER BY revenue DESC
        LIMIT 5
      `,
      sql`
        SELECT COALESCE(p.category, 'unknown') AS category,
               SUM((item->>'qty')::int) AS qty,
               SUM((item->>'price')::int * (item->>'qty')::int) AS revenue
        FROM orders o
        CROSS JOIN LATERAL jsonb_array_elements(o.items) AS item
        LEFT JOIN products p ON p.id = (item->>'productId')::int
        WHERE o.status = ANY(${PAID_STATUSES})
        GROUP BY p.category
        ORDER BY revenue DESC
      `,
      sql`
        SELECT COUNT(*) AS total,
               COUNT(*) FILTER (WHERE in_stock) AS in_stock,
               COUNT(*) FILTER (WHERE NOT in_stock) AS sold_out
        FROM products
      `,
      sql`
        SELECT category, COUNT(*) AS total, COUNT(*) FILTER (WHERE in_stock) AS in_stock
        FROM products
        GROUP BY category
      `,
      sql`
        SELECT id, name, category, enquiry_clicks
        FROM products
        WHERE enquiry_clicks > 0
        ORDER BY enquiry_clicks DESC
        LIMIT 5
      `,
      sql`
        SELECT id, action, details, created_at
        FROM activity_log
        ORDER BY created_at DESC
        LIMIT 15
      `,
    ]);

    return res.status(200).json({
      revenue: {
        today: Number(revenue.today),
        thisMonth: Number(revenue.this_month),
        allTime: Number(revenue.all_time),
      },
      topProducts,
      topCategories,
      catalog: {
        total: Number(catalogTotals.total),
        inStock: Number(catalogTotals.in_stock),
        soldOut: Number(catalogTotals.sold_out),
        byCategory: catalogByCategory,
      },
      topEnquired,
      recentActivity,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
