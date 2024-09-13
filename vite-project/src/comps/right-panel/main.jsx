import React from 'react'
import Nav from './top-nav/Nav'
import { Divider, Typography } from '@mui/material';
import Console from './Console';

export default function () {
    const [value, setValue] = React.useState(0);
    let consoleText = 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Repudiandae, cumque doloremque ducimus necessitatibus deleniti tempora enim consectetur in minus debitis illo, quod error recusandae? Doloribus similique expedita sit enim tempore facere eum optio fugit, iste ex esse soluta facilis, quaerat placeat rem asperiores voluptates cumque officiis perspiciatis, ipsa aspernatur vero nesciunt repudiandae magni! Fugiat atque harum eligendi, corrupti ullam dolorum omnis magni excepturi repellendus sit beatae cupiditate et eaque ipsam rerum unde saepe ad esse. Totam quibusdam, expedita atque reiciendis distinctio facere dolores eveniet deleniti. Obcaecati animi debitis repellendus enim ad odio distinctio atque error velit voluptatem quae nihil, sequi praesentium accusamus eos inventore beatae labore esse! Impedit sapiente sunt explicabo quisquam labore provident doloribus asperiores magnam sequi soluta quam similique deleniti esse velit, magni error aliquid. Earum accusantium est corrupti molestiae consequatur vero impedit labore qui similique porro quidem amet odio eum et, facilis itaque nesciunt iure culpa ipsa aspernatur nobis explicabo maiores? Nobis dignissimos nisi quam. Ipsa nostrum quos quisquam blanditiis incidunt nulla consectetur nisi ab tenetur aspernatur est, similique culpa repellat? Fugiat repellat similique totam ab officiis velit veniam quae, atque possimus in deleniti qui quod ipsum, quasi iure sint molestiae aliquid pariatur ipsa repellendus. Hic nemo alias temporibus illo debitis! Facere suscipit aliquid rem exercitationem nihil, eveniet totam a deleniti ad atque, minima possimus consequatur quis vero tenetur iure magni illum odio, ex soluta blanditiis. Architecto saepe voluptate impedit magnam beatae vel, veritatis maiores? Delectus at aspernatur perspiciatis! Quam, quibusdam officiis. Sit ipsam eligendi a fuga in aliquid vel odio expedita, ea pariatur quaerat laboriosam illo fugit velit doloremque impedit nesciunt praesentium commodi facere. Sequi tenetur itaque laudantium beatae, nemo vero. Deleniti, quidem? Doloremque natus dolorem excepturi at architecto quaerat facilis soluta vero vel dolore minus odio magnam minima illo labore, ad, sed quasi, deserunt in?';
    let ins = "Instructions Texdsadasdt";
  return (
    <div>
        <Nav value={value} setValue={setValue}/>
        <Divider variant='middle'/>
        <Typography component="div" >
            {value === 0 && <Console consoleText={consoleText}/>}
            {value === 1 &&  <Console consoleText={ins}/>}
        </Typography>

    </div>
  )
}
