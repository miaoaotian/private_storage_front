<template>
    <div>
      <table>
        <thead>
          <tr>
            <th v-for="(header, index) in headers" :key="index">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
            <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import * as XLSX from 'xlsx';
  
  export default {
    name: 'ExcelPreview',
    props: {
      url: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        headers: [],
        rows: []
      };
    },
    watch: {
      url: {
        immediate: true,
        handler(newUrl) {
          if (newUrl) {
            this.fetchExcelContent(newUrl);
          }
        }
      }
    },
    methods: {
      async fetchExcelContent(url) {
        try {
          const response = await axios.get(url, { responseType: 'arraybuffer' });
          const data = new Uint8Array(response.data);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonSheet = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
          if (jsonSheet.length > 0) {
            this.headers = jsonSheet[0];
            this.rows = jsonSheet.slice(1);
          }
        } catch (error) {
          console.error('Error fetching or parsing Excel content:', error);
        }
      }
    },
    mounted() {
      if (this.url) {
        this.fetchExcelContent(this.url);
      }
    }
  };
  </script>
  
  <style scoped>
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
  }
  
  th, td {
    border: 1px solid #ddd;
    padding: 0.5em;
    text-align: left;
  }
  
  th {
    background-color: #f4f4f4;
  }
  </style>
  