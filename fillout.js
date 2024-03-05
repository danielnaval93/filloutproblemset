const express = require('express');
const axios = require('axios');
const router = express.Router();
const apiKey = 'sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912';
const formId = 'cLZojxk94ous'; 
const axiosInstance = axios.create({
  baseURL: 'https://api.fillout.com',
  headers: {
    Authorization: `Bearer ${apiKey}`
  }
})

router.get('/:formId/filteredResponses', async (req, res, next) => {
  const submissionsQueryParams = {
    formId: req.params.formId,
    limit: req.query.limit,
    afterDate: req.query.afterDate,
    beforeDate: req.query.beforeDate,
    offset: req.query.offset,
    status: req.query.offset,
    includeEditLink: req.query.includeEditLink,
    sort: req.query.sort
  }
  const response = await axiosInstance.get(`/v1/api/forms/${formId}/submissions`,
  submissionsQueryParams);
  const filters = req.query.filters;
  if (filters === undefined) {
    res.send(response.data);
  } else {
    const filteredData = applyFilters(response.data, JSON.parse(filters));
    res.send(filteredData);
  }
});

function applyFilters(data, filters) {
  const filteredData = data.responses.filter((response) => {
    var filterResult = true;
    filters.forEach((filter) => {
      const questions = response.questions;
      const questionMap = new Map(questions.map(question => [question.id, question]));
      filterResult = filterResult && applyFilter(questionMap, filter);
    });
    return filterResult;
  });
  const totalResponses = filteredData.length;
  return {
    "responses": filteredData,
    "totalResponses": filteredData.length,
    "pageCount": data.pageCount
  }
}

function applyFilter(questionMap, filter) {
  const id = filter.id;
  const condition = filter.condition;
  const value = filter.value;
  const matchingQuestion = questionMap.get(id);
  /** Here I chose to filter out results that did not have a matching question id **/
  if (matchingQuestion === undefined) {
    return false;
  }
  if (condition === 'equals') {
    return matchingQuestion.value === value;
  }
  if (condition === 'does_not_equal') {
    return matchingQuestion.value !== value;
  }
  if (condition === 'greater_than') {
    return matchingQuestion.value > value;
  }
  if (condition === 'less_than') {
    return matchingQuestion.value < value;
  }
}

module.exports = router;
