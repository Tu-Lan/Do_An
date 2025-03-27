import filter from '../assets/features/filter.png';
import rating from '../assets/features/rating.png';
import wishlist from '../assets/features/wishlist.png';
import secure from '../assets/features/secure.png';


const Features = () => {
  return (
    <section className='max-padd-container py-16'>
    <div className='max-padd-container grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 gap-y-12'>
      <div className='flexCenter flex-col gap-3'>
        <img src={filter} alt='FeatureIcon' height={44} width={44}/>
        <div className='flexCenter flex-col'>
          <h5 className='h5'>Hỗ trợ tìm kiếm và lọc sản phẩm</h5>
          <hr className='w-8 bg-secondary h-1 rounded-full border-none'/>
        </div>
          <p className='text-center'>Tìm kiếm sách dễ dàng theo tiêu đề, tác giả, thể loại hoặc phạm vi giá.</p>
      </div>
      <div className='flexCenter flex-col gap-3'>
        <img src={rating} alt='FeatureIcon' height={44} width={44}/>
        <div className='flexCenter flex-col'>
          <h5 className='h5'>Đánh giá và xếp hạng của khách hàng</h5>
          <hr className='w-8 bg-secondary h-1 rounded-full border-none'/>
        </div>
          <p className='text-center'>Khách hàng có thể chia sẻ đánh giá, xếp hạng sách và hướng dẫn độc giả tương lai.</p>
      </div>
      <div className='flexCenter flex-col gap-3'>
        <img src={wishlist} alt='FeatureIcon' height={44} width={44}/>
        <div className='flexCenter flex-col'>
          <h5 className='h5'>Danh sách muốn và yêu thích</h5>
          <hr className='w-8 bg-secondary h-1 rounded-full border-none'/>
        </div>
          <p className='text-center'>Lưu sách vào danh sách mong muốn để mua sau hoặc dễ dàng truy cập.</p>
      </div>
      <div className='flexCenter flex-col gap-3'>
        <img src={secure} alt='FeatureIcon' height={44} width={44}/>
        <div className='flexCenter flex-col'>
          <h5 className='h5'>Thanh toán trực tuyến an toàn</h5>
          <hr className='w-8 bg-secondary h-1 rounded-full border-none'/>
        </div>
          <p className='text-center'>Tận hưởng quá trình thanh toán liền mạch với nhiều tùy chọn thanh toán an toàn.</p>
      </div>
    </div>
    </section>
  )
}

export default Features
