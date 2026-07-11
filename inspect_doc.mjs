import mammoth from 'mammoth';

const result = await mammoth.extractRawText({ 
  path: 'data/Provision_Store_Category_Product_Architecture_Prompt-754976.docx' 
});

console.log(result.value);
