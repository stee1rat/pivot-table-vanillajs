;(function(window) {

  'use strict';

  // private
  let _container;
  let _data;
  let _cols;
  let _rows;
  let _operator;
  let _value;

  function Pivot(container, data, cols, rows, operator, value) {
    _container = document.getElementById(container);
    _data = data;
    _cols = cols;
    _rows = rows;
    _operator = operator;
    _value = value;

    this._init();
  }

  Pivot.prototype._init = function() {
    this.render();
  }

  Pivot.prototype.render = function() {
    _container.innerHTML = '';

    let data = _data;
    let cols = _cols;
    let rows = _rows;
    let operator = _operator;
    let value = _value;

    let uniquePropertyValues = function(objects, properties) {
      let result = [];

      objects.forEach(o => {
        let object = {};
        properties.forEach(p => object[p] = o[p]);
        object = JSON.stringify(object);
        if (result.indexOf(object) < 0) {
          result.push(object);
        }
      });

      return result.map(x => JSON.parse(x));
    };

    let uniqueRows = uniquePropertyValues(data, rows);
    let uniqueCols = uniquePropertyValues (data, cols);

    let table = document.createElement("table");
    for (let i = 0; i < uniqueRows.length + cols.length ; i++) {
      let tr = table.insertRow(-1);
      let prevCell = null;

      for (let j = 0; j <= uniqueCols.length + rows.length; j++) {
        let cell = tr.insertCell(-1);
        cell.innerHTML = '&nbsp;';
        if (i == cols.length - 1 && j < rows.length) {
          cell.innerHTML = rows[j] ;
        }
        if (i < cols.length  && j == rows.length ) {
          cell.innerHTML = cols[i] ;
        }
        if (i < cols.length) {
          if (j > rows.length) {
            cell.innerHTML = uniqueCols[j - rows.length - 1][cols[i]];
            if (prevCell) {
              if (prevCell.innerHTML == cell.innerHTML) {
                if (!prevCell.hasAttribute("colspan")) {
                  prevCell.setAttribute("colspan", 2);
                } else {
                  prevCell.setAttribute("colspan", Number(prevCell.getAttribute("colspan")) + 1);
                }
                tr.deleteCell(cell.cellIndex);
                cell = prevCell;
              }
            }
            prevCell = cell;
          }
        } else {
          if (j < rows.length) {
            if (i == cols.length - 1) {
              cell.innerHTML = rows[j];
            } else {
              cell.innerHTML = uniqueRows[i - cols.length][rows[j]];
            }
          }
          if (j == rows.length) {
            table.rows[i].cells[cell.cellIndex - 1].setAttribute("colspan", 2);
            table.rows[i].deleteCell(cell.cellIndex);
          }
          if (j > rows.length) {
            // loop through data for every cell
            let fields = Object.assign({},uniqueCols[j - rows.length - 1], uniqueRows[i - cols.length]);
            let sum = 0;
            let count = 0;
            loop1:
            for (let d = 0 ; d < data.length; d++) {
              for (let key in fields) {
                if (fields.hasOwnProperty(key)) {
                  if (data[d][key] != fields[key]) continue loop1;
                }
              }
              count++;
              sum += Number(data[d][value]);
            }
            switch(operator) {
              case 'count':
                cell.innerHTML = count;
                break;
              case 'sum':
                cell.innerHTML = sum;
                break;
              case 'avg':
                cell.innerHTML = sum/count;
                break;
              default:
                cell.innerHTML = 0;
            }
          }
        }
      }
    }

    for (let i = rows.length - 1; i >= 0 ; i--) {
      if (i === 0) {
        table.rows[0].cells[0].setAttribute("colspan", rows.length );
      } else {
        table.rows[0].deleteCell(i);
      }
      let first = null;
      for (let j = cols.length, count = 1; j < cols.length + uniqueRows.length + 1; j++ ) {
        if (first !== null) {
          if (j < table.rows.length && first.innerHTML == table.rows[j].cells[i].innerHTML) {
            count++;
          } else {
            first.setAttribute("rowspan", count);
            while (count > 1) {
              table.rows[first.parentNode.rowIndex + count - 1].deleteCell(i);
              count--;
            }
            if (j < table.rows.length) {
              first = table.rows[j].cells[i];
            }
          }
        } else {
          first = table.rows[j].cells[i];
        }
      }
    }

    _container.appendChild(table);
  }

  Pivot.prototype.setOperator = operator => {
    _operator = operator;
  }

  Pivot.prototype.setRows = rows => {
    _rows = rows;
  }

  Pivot.prototype.setColumns = cols => {
    _cols = cols;
  }

  Pivot.prototype.setValue = value => {
    _value = value;
  }

  Pivot.prototype.setData = data => {
    _data = data;
  }

  window.Pivot = Pivot;

})(window);
