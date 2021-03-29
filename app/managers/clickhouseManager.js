const {ClickHouse} = require('clickhouse');
const marDb = require('../managers/mariaDbManager')

const clickhouse = new ClickHouse({
    url: '127.0.0.1',
    port: 8123,
});

module.exports = {
    selectQuery: async function selectQuery(key,id_query) {

        function check_letters(check_string, name) {
            console.log('check')
            const value = [];
            for (let index = 0; index < check_string.length; index++) {
                switch (check_string[index]) {
                    case '=':
                        if (check_string[index + 1] === '<') {
                            value.push(` =`);
                            break;
                        }
                        if (check_string[index - 1] === '>') {
                            value.push(`= `);
                            break;
                        }
                        value.push(` = `);
                        break;
                    case '<':
                        if (check_string[index + 1] === '=') {
                            value.push(` <`);
                            break;
                        } else {
                            value.push(` < `);
                            break;
                        }

                    case '>':
                        if (check_string[index + 1] === '=') {
                            value.push(` >`);
                            break;
                        } else {
                            value.push(` > `);
                            break;
                        }
                    case '&':
                        value.push(` and `);
                        value.push(name);
                        break;
                    case '|':
                        value.push(` or `);
                        value.push(name);
                        break;
                    case '^':
                        value.push(` in `);
                        break;
                    case '(':
                        value.push(` [`);
                        break;
                    case ')':
                        value.push(`] `);
                        break;
                    default:
                        value.push(check_string[index]);
                }
            }
            let new_value = value.join('').split(' ')
            let check_two = ``;
            for (let index = 0; index < new_value.length; index++) {
                switch (new_value[index]) {
                    case' ':
                        check_two = check_two + ' ' + new_value[index];
                        break;
                    case'=':
                        check_two = check_two + ' ' + new_value[index] + ' ';
                        break;
                    case '>':
                        check_two = check_two + ' ' + new_value[index];
                        break;
                    case'>=':
                        check_two = check_two + ' ' + new_value[index];
                        break;
                    case'<':
                        check_two = check_two + ' ' + new_value[index];
                        break;
                    case'<=':
                        check_two = check_two + ' ' + new_value[index];
                        break;
                    case'or':
                        check_two = check_two + ' ' + new_value[index];
                        break;
                    case'and':
                        check_two = check_two + ' ' + new_value[index];
                        break;
                    case'in':
                        check_two = check_two + ' ' + new_value[index];
                        break;
                    case name:
                        check_two = check_two + ' ' + new_value[index];
                        break;
                    default:
                        if (isNaN(new_value[index])) {

                            if (new_value[index].includes('[')) {
                                check_two = check_two + ' ' + new_value[index];
                            } else {
                                check_two = check_two + ` '` + new_value[index] + `'`;
                            }
                        } else {
                            check_two = check_two + ' ' + new_value[index];
                        }
                        break;
                }
            }
            return check_two;
        }


        function built_query_select(object_front) {

            const Query = ['select '];
            let select_name = [], count_select = 0;
            if (Object.keys(object_front.filters).length >= 1) {
                let length_filter = Object.keys(object_front.filters);

                while (length_filter.length) {
                    let key = length_filter.shift()
                    if (object_front.filters[key].show) {
                        count_select++;
                        if (object_front.filters[key].option.length) {
                            switch (object_front.filters[key].option) {
                                case 'avg':
                                    select_name.push(` avg(${object_front.filters[key].name})`);
                                    break;
                                case 'sum':
                                    select_name.push(` sum(${object_front.filters[key].name})`);
                                    break;
                                case 'min':
                                    select_name.push(` min(${object_front.filters[key].name})`);
                                    break;
                                case 'max':
                                    select_name.push(` max(${object_front.filters[key].name})`);
                                    break;
                                case 'count':
                                    select_name.push(` count(${object_front.filters[key].name})`);
                                    break;
                                case 'distinct':
                                    select_name.push(` distinct ${object_front.filters[key].name}`);
                                    break;
                                case 'count distinct':
                                    select_name.push(` count(distinct ${object_front.filters[key].name})`);
                                    break;
                                default:
                                    break;
                            }
                        } else {
                            select_name.push(object_front.filters[key].name);
                        }
                    }
                }
                Query[0] = Query[0] + select_name.join(', ');
            } else {
                Query[0] = Query[0] + ` *`;
            }

            return Query[0];
        }

        function built_query(object_front) {

            const Query = [''];
            let data_filter = 1, count_filter = 0, counter_select = 0;
            Query[0] = Query[0] + ` from ${object_front.database}.${object_front.table}`;
            let length_filter = Object.keys(object_front.filters);
            while (length_filter.length) {
                let key = length_filter.shift()
                if (object_front.filters[key].filters) {
                    count_filter++;
                }
            }
            if (Object.keys(object_front.filters) && count_filter) {
                Query[0] = Query[0] + ` where`;
                let length_filter = Object.keys(object_front.filters);
                while (length_filter.length) {
                    let key = length_filter.shift()
                    if (object_front.filters[key].filters) {
                        if (object_front.filters[key].name === 'EventDate') {
                            data_filter = 0;
                        } else {
                            if (counter_select === 0) {
                                const check_string = check_letters(object_front.filters[key].filters, object_front.filters[key].name);
                                if (check_string.includes(' or ') || check_string.includes(' and ')) {
                                    Query[0] = Query[0] + ` ( ` + `${object_front.filters[key].name}`;
                                    Query[0] = Query[0] + check_string + `) `;
                                } else {
                                    Query[0] = Query[0] + ` ${object_front.filters[key].name}`;
                                    Query[0] = Query[0] + check_string;
                                }
                                counter_select++;
                            } else {
                                Query[0] = Query[0] + ` and (${object_front.filters[key].name}`;
                                const value = check_letters(object_front.filters[key].filters, object_front.filters[key].name);
                                Query[0] = Query[0] + value + ` )`;
                            }
                        }
                    }
                }
            }
            if (data_filter) {
                if (count_filter === 0) {
                    Query[0] = Query[0] + ` where EventDate>='${object_front.startDate}' and  EventDate<='${object_front.endDate}'`;
                } else {
                    if (Object.keys(object_front.filters)) {
                        Query[0] = Query[0] + ` and (EventDate>='${object_front.startDate}' and  EventDate<='${object_front.endDate}')`;
                    }
                }
            }
            return Query[0];
        }
        function  built_query_end(object_front) {

            const Query = [''];
            if (object_front.groupBy.length) {
                Query[0] = Query[0] + ` group by ${object_front.groupBy[0]}`;
                if (object_front.groupBy.length > 1) {
                    for (let index = 1; index < object_front.groupBy.length - 1; index++) {
                        Query[0] = Query[0] + `, ${object_front.groupBy[index]} `;
                    }
                }
            }
            if (object_front.sortBy.length) {
                Query[0] = Query[0] + ` order by ${object_front.sortBy[0]}`;
                if (object_front.sortBy.length > 1) {
                    for (let index = 1; index < object_front.sortBy.length - 1; index++) {
                        Query[0] = Query[0] + `, ${object_front.sortBy[index]} `;
                    }
                }
                if (object_front.order.length) {
                    Query[0] = Query[0] + ` ${object_front.order}`;
                }
            }
            if (object_front.limit) {
                Query[0] = Query[0] + ` limit ${object_front.limit}`;
            }
            Query[0] = Query[0] + ` offset ${object_front.offset}`;

            return Query[0];
        }
        const query_object =await marDb.getQuery(id_query)

        if( await marDb.checkKeyUsers(query_object[0].user_id,key)){
            const object_front =JSON.parse(query_object[0].query)
                const query = built_query_select(object_front) + built_query(object_front) + built_query_end(object_front) + ';';
                 await  marDb. addNewLog(id_query)
                return await clickhouse.query(query).toPromise();
            } else{
            return  'Error Access'
        }


    }

}