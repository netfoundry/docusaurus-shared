import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

import Card from '@zrokroot/src/components/Card';
import CardBody from '@zrokroot/src/components/Card/CardBody';
import CardFooter from '@zrokroot/src/components/Card/CardFooter';
import CardHeader from '@zrokroot/src/components/Card/CardHeader';
import CardImage from '@zrokroot/src/components/Card/CardImage';
import Columns from '@zrokroot/src/components/Columns';
import Column from '@zrokroot/src/components/Column';

export default {
  ...MDXComponents,
  LiteYouTubeEmbed,

    /* zrok */
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    CardImage,
    Columns,
    Column,
};
