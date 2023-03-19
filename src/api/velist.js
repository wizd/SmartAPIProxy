const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  // 构造数据
  const veList = [
    { id: 1, name: "VE1", description: "This is VE1" },
    { id: 2, name: "VE2", description: "This is VE2" },
    { id: 3, name: "VE3", description: "This is VE3" }
  ];

  // 返回数据
  res.json(veList);
});

module.exports = router;
