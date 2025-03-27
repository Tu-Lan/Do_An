/* eslint-disable react/prop-types */

const Title = ({ title1, title2, titleStyles, title1Styles, paraStyles }) => {
  return (
    <div className={`${titleStyles} pb-1`}>
      <h2 className={`${title1Styles} h2`}>
        {title1}
        <span className={`text-secondary !font-light ml-2`}>{title2}</span>
      </h2>
      <p className={`${paraStyles} hidden`}>
        Từ những tác phẩm kinh điển vượt thời gian đến những kiệt tác hiện đại, hãy tìm <br />
        cuốn sách hoàn hảo cho mọi khoảnh khắc.
      </p>
    </div>
  )
}



export default Title
