function parsePagination(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const offset = (page - 1) * limit;

    return { page, limit, offset };
}

function buildPaginationMeta(page, limit, total) {
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    };
}

function buildPaginatedQuery(baseQuery, orderBy, page, limit, offset) {
    const countQuery = `SELECT COUNT(*) AS total FROM (${baseQuery}) AS _count`;
    const dataQuery = `
        ${baseQuery}
        ORDER BY ${orderBy}
        OFFSET ${offset} ROWS
        FETCH NEXT ${limit} ROWS ONLY
    `;

    return { countQuery, dataQuery };
}

module.exports = { parsePagination, buildPaginationMeta, buildPaginatedQuery };
